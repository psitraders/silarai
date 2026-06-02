using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Infrastructure.Services;

public class InstagramService : IInstagramService
{
    private readonly HttpClient _http;
    private readonly ILogger<InstagramService> _logger;
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IConfiguration _configuration;
    private readonly string _apiVersion;

    public InstagramService(
        IHttpClientFactory httpClientFactory,
        ILogger<InstagramService> logger,
        AppDbContext db,
        ITenantContext tenantContext,
        IConfiguration configuration)
    {
        _http = httpClientFactory.CreateClient("Instagram");
        _logger = logger;
        _db = db;
        _tenantContext = tenantContext;
        _configuration = configuration;
        _apiVersion = configuration["Instagram:ApiVersion"] ?? "v19.0";
    }

    public bool IsConfigured
    {
        get
        {
            var business = _db.Businesses
                .FirstOrDefault(b => b.TenantId == _tenantContext.CurrentTenantId);
            return !string.IsNullOrEmpty(business?.InstagramAccountId)
                && !string.IsNullOrEmpty(business?.InstagramAccessToken);
        }
    }

    public async Task SendTextMessageAsync(string toIgScopedId, string message, CancellationToken ct = default)
    {
        var (accountId, accessToken) = await GetCredentialsAsync(ct);
        if (accountId == null || accessToken == null)
        {
            _logger.LogWarning("Instagram credentials not configured for tenant {TenantId}. Skipping send.", _tenantContext.CurrentTenantId);
            return;
        }

        // Instagram Messaging API: POST /{ig-user-id}/messages
        var url = $"https://graph.facebook.com/{_apiVersion}/{accountId}/messages";
        var payload = new
        {
            recipient = new { id = toIgScopedId },
            message = new { text = message }
        };

        await PostAsync(url, payload, accessToken, ct);
    }

    /// <summary>
    /// Looks up which tenant owns the given Instagram account ID.
    /// Used by the webhook controller to route incoming DMs.
    /// </summary>
    public async Task<Guid?> ResolveTenantByAccountIdAsync(string instagramAccountId, CancellationToken ct = default)
    {
        var business = await _db.Businesses
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.InstagramAccountId == instagramAccountId && !b.IsDeleted, ct);

        return business?.TenantId;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<(string? AccountId, string? AccessToken)> GetCredentialsAsync(CancellationToken ct)
    {
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == _tenantContext.CurrentTenantId, ct);

        if (business != null
            && !string.IsNullOrEmpty(business.InstagramAccountId)
            && !string.IsNullOrEmpty(business.InstagramAccessToken))
        {
            return (business.InstagramAccountId, business.InstagramAccessToken);
        }

        return (null, null);
    }

    private async Task PostAsync(string url, object payload, string accessToken, CancellationToken ct)
    {
        try
        {
            var json = JsonSerializer.Serialize(payload);
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Instagram API error {Status}: {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Instagram message to {Url}", url);
        }
    }
}
