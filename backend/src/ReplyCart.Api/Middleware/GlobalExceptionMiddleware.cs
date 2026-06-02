using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using ReplyCart.Application.Common.Exceptions;

namespace ReplyCart.Api.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception on {Method} {Path}: {Message}",
                context.Request.Method, context.Request.Path, ex.Message);
            await HandleExceptionAsync(context, ex, env.IsDevelopment());
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, bool isDevelopment)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, title, errors) = exception switch
        {
            ValidationException ve => (HttpStatusCode.UnprocessableEntity, "Validation Failed",
                ve.Errors.SelectMany(e => e.Value.Select(v => $"{e.Key}: {v}"))),
            NotFoundException => (HttpStatusCode.NotFound, "Not Found", (IEnumerable<string>)[exception.Message]),
            ForbiddenException => (HttpStatusCode.Forbidden, "Forbidden", (IEnumerable<string>)[exception.Message]),
            PlanLimitException => (HttpStatusCode.PaymentRequired, "Plan Limit Exceeded", (IEnumerable<string>)[exception.Message]),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized", (IEnumerable<string>)[exception.Message]),
            _ => (HttpStatusCode.InternalServerError, "Internal Server Error",
                isDevelopment
                    ? (IEnumerable<string>)[$"{exception.GetType().Name}: {exception.Message}", exception.StackTrace ?? ""]
                    : ["An unexpected error occurred."])
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            type = "https://tools.ietf.org/html/rfc7807",
            title,
            status = (int)statusCode,
            errors = errors.ToArray(),
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
