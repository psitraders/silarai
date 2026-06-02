using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Infrastructure.Services;

public class FacebookService : IFacebookService
{
    private readonly HttpClient _http;
    private readonly ILogger<FacebookService> _logger;
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IConfiguration _configuration;
    private readonly string _apiVersion;

    public FacebookService(
        IHttpClientFactory httpClientFactory,
        ILogger<FacebookService> logger,
        AppDbContext db,
        ITenantContext tenantContext,
        IConfiguration configuration)
    {
        _http = httpClientFactory.CreateClient("Facebook");
        _logger = logger;
        _db = db;
        _tenantContext = tenantContext;
        _configuration = configuration;
        _apiVersion = configuration["Facebook:ApiVersion"] ?? "v19.0";
    }

    public bool IsConfigured
    {
        get
        {
            var business = _db.Businesses
                .FirstOrDefault(b => b.TenantId == _tenantContext.CurrentTenantId);
            return !string.IsNullOrEmpty(business?.FacebookPageId)
                && !string.IsNullOrEmpty(business?.FacebookPageAccessToken);
        }
    }

    public async Task SendTextMessageAsync(string toPageScopedId, string message, CancellationToken ct = default)
    {
        var (pageId, accessToken) = await GetCredentialsAsync(ct);
        if (pageId == null || accessToken == null)
        {
            _logger.LogWarning("Facebook credentials not configured for tenant {TenantId}. Skipping send.", _tenantContext.CurrentTenantId);
            return;
        }

        // Facebook Messenger Send API: POST /me/messages?access_token={page_token}
        var url = $"https://graph.facebook.com/{_apiVersion}/me/messages?access_token={Uri.EscapeDataString(accessToken)}";
        var payload = new
        {
            recipient = new { id = toPageScopedId },
            message = new { text = message },
            messaging_type = "RESPONSE"
        };

        await PostAsync(url, payload, accessToken, ct);
    }

    /// <summary>
    /// Looks up which tenant owns the given Facebook Page ID.
    /// Used by the webhook controller to route incoming messages.
    /// </summary>
    public async Task<Guid?> ResolveTenantByPageIdAsync(string pageId, CancellationToken ct = default)
    {
        var business = await _db.Businesses
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.FacebookPageId == pageId && !b.IsDeleted, ct);

        return business?.TenantId;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<(string? PageId, string? AccessToken)> GetCredentialsAsync(CancellationToken ct)
    {
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == _tenantContext.CurrentTenantId, ct);

        if (business != null
            && !string.IsNullOrEmpty(business.FacebookPageId)
            && !string.IsNullOrEmpty(business.FacebookPageAccessToken))
        {
            return (business.FacebookPageId, business.FacebookPageAccessToken);
        }

        return (null, null);
    }

    private async Task PostAsync(string url, object payload, string accessToken, CancellationToken ct)
    {
        try
        {
            var json = JsonSerializer.Serialize(payload);
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            // For Facebook Messenger, token is in the query string but also set as Bearer for safety
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Facebook API error {Status}: {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Facebook message to {Url}", url);
        }
    }
}
