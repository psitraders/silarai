using System.Text;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ReplyCart.Api.Middleware;
using ReplyCart.Infrastructure;
using ReplyCart.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Create wwwroot + upload dirs BEFORE Build() so WebRootPath is never null
var wwwroot = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(Path.Combine(wwwroot, "uploads", "products"));
Directory.CreateDirectory(Path.Combine(wwwroot, "uploads", "store"));
builder.Environment.WebRootPath = wwwroot;

// Infrastructure (EF Core, services, storage, AI)
builder.Services.AddInfrastructure(builder.Configuration);

// GA4 Analytics service (uses platform service account to call GA4 Data API)
builder.Services.AddHttpClient();
builder.Services.AddScoped<ReplyCart.Api.Services.GA4AnalyticsService>();

// MediatR — scans Application assembly for handlers
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(ReplyCart.Application.Auth.Commands.LoginCommand).Assembly));

// Memory cache for tenant resolution
builder.Services.AddMemoryCache();

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret not configured.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Disable claim-type remapping so "tid", "sub", "email" etc. are always
        // accessible by their literal JWT names — no CLR-URI surprises.
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "replycart.app",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "replycart.app",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            // With MapInboundClaims=false claim names stay as their literal JWT keys.
            // We generate role claims with key "role" (not ClaimTypes.Role URI), so
            // tell ASP.NET Core to use "role" when evaluating [Authorize(Roles=...)].
            RoleClaimType = "role",
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    // Fully open policy for public chatbot widget endpoints (no cookies, auth via API key)
    options.AddPolicy("AllowWidget", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173"];

        // Separate exact origins from wildcard patterns (e.g. "https://*.vercel.app")
        var exactOrigins = origins.Where(o => !o.Contains('*')).ToArray();
        var wildcardSuffixes = origins
            .Where(o => o.Contains('*'))
            .Select(o => o.Replace("https://*", "https://").Replace("http://*", "http://"))
            .ToArray(); // e.g. "https://.vercel.app"

        policy.SetIsOriginAllowed(origin =>
            {
                // Allow localhost for development
                if (origin.StartsWith("http://localhost") || origin.StartsWith("http://127.0.0.1")) return true;
                // Allow all configured exact origins
                if (exactOrigins.Contains(origin)) return true;
                // Allow wildcard suffix matches (e.g. any *.vercel.app)
                if (wildcardSuffixes.Any(suffix => origin.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))) return true;
                // Allow any HTTPS origin — needed for seller custom domains (SaaS)
                if (origin.StartsWith("https://")) return true;
                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ReplyCart API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme. Enter: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Swagger available in all environments (safe for internal API)
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ReplyCart API v1"));

// Apply EF Core migrations and seed on startup
// Wrapped in try/catch so a transient DB hiccup doesn't crash the whole process
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DataSeeder.SeedAsync(app.Services, app.Logger);
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Startup DB migration/seed failed — app will still start.");
}

app.UseStaticFiles();
app.UseMiddleware<GlobalExceptionMiddleware>();

// ── Public chatbot widget CORS ────────────────────────────────────────────────
// Must run BEFORE the general UseCors so it short-circuits preflight requests
// and stamps Access-Control-Allow-Origin: * on every /api/v1/chatbot/* response.
// These endpoints authenticate via API key in the URL — no cookies needed.
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/v1/chatbot"))
    {
        context.Response.Headers["Access-Control-Allow-Origin"]  = "*";
        context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
        context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type";

        if (HttpMethods.IsOptions(context.Request.Method))
        {
            context.Response.StatusCode = 204;
            return; // short-circuit — no further processing needed
        }
    }
    await next();
});
// ─────────────────────────────────────────────────────────────────────────────

app.UseRouting();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();
