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

// Infrastructure (EF Core, services, storage, AI)
builder.Services.AddInfrastructure(builder.Configuration);

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
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173"];
        policy.WithOrigins(origins)
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ReplyCart API v1"));
}

// Ensure wwwroot exists so UseStaticFiles can serve uploaded files immediately
Directory.CreateDirectory(Path.Combine(app.Environment.ContentRootPath, "wwwroot"));
Directory.CreateDirectory(Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads", "products"));

// Apply EF Core migrations and seed sample data on first run
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}
await DataSeeder.SeedAsync(app.Services, app.Logger);

// CORS must come before static files so that /uploads/* responses include
// the Access-Control-Allow-Origin header.
app.UseCors("AllowFrontend");
app.UseStaticFiles();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();
