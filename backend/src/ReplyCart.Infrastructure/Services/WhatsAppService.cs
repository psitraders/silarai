using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Infrastructure.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly HttpClient _http;
    private readonly ILogger<WhatsAppService> _logger;
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IConfiguration _configuration;
    private readonly string _apiVersion;

    // Fallback credentials from config (for dev / single-tenant setups)
    private readonly string? _configPhoneNumberId;
    private readonly string? _configAccessToken;

    public WhatsAppService(
        IHttpClientFactory httpClientFactory,
        ILogger<WhatsAppService> logger,
        AppDbContext db,
        ITenantContext tenantContext,
        IConfiguration configuration)
    {
        _http = httpClientFactory.CreateClient("WhatsApp");
        _logger = logger;
        _db = db;
        _tenantContext = tenantContext;
        _configuration = configuration;
        _apiVersion = configuration["WhatsApp:ApiVersion"] ?? "v19.0";
        _configPhoneNumberId = configuration["WhatsApp:PhoneNumberId"];
        _configAccessToken = configuration["WhatsApp:AccessToken"];
    }

    public bool IsConfigured
    {
        get
        {
            // True if either DB credentials or config credentials are present
            return !string.IsNullOrEmpty(_configPhoneNumberId) && !string.IsNullOrEmpty(_configAccessToken);
        }
    }

    public async Task SendTextMessageAsync(string toPhone, string message, CancellationToken ct = default)
    {
        var (phoneNumberId, accessToken) = await GetCredentialsAsync(ct);
        if (phoneNumberId == null || accessToken == null)
        {
            _logger.LogWarning("WhatsApp credentials not configured for tenant {TenantId}. Skipping send.", _tenantContext.CurrentTenantId);
            return;
        }

        var url = $"https://graph.facebook.com/{_apiVersion}/{phoneNumberId}/messages";
        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = NormalizePhone(toPhone),
            type = "text",
            text = new { preview_url = false, body = message }
        };

        await PostAsync(url, payload, accessToken, ct);
    }

    public async Task SendTemplateMessageAsync(string toPhone, string templateName, string languageCode, CancellationToken ct = default)
    {
        var (phoneNumberId, accessToken) = await GetCredentialsAsync(ct);
        if (phoneNumberId == null || accessToken == null)
        {
            _logger.LogWarning("WhatsApp credentials not configured. Skipping template send.");
            return;
        }

        var url = $"https://graph.facebook.com/{_apiVersion}/{phoneNumberId}/messages";
        var payload = new
        {
            messaging_product = "whatsapp",
            to = NormalizePhone(toPhone),
            type = "template",
            template = new { name = templateName, language = new { code = languageCode } }
        };

        await PostAsync(url, payload, accessToken, ct);
    }

    /// <summary>
    /// Looks up which tenant owns the given WhatsApp Phone Number ID.
    /// Used by the webhook controller to route incoming messages.
    /// </summary>
    public async Task<Guid?> ResolveTenantByPhoneNumberIdAsync(string phoneNumberId, CancellationToken ct = default)
    {
        // 1. Check DB — tenant has set their credentials in the dashboard
        var business = await _db.Businesses
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.WhatsAppPhoneNumberId == phoneNumberId && !b.IsDeleted, ct);

        if (business != null)
            return business.TenantId;

        // 2. Fallback — single-tenant setup via appsettings.json
        if (phoneNumberId == _configPhoneNumberId)
        {
            var tenantIdStr = _configuration["WhatsApp:DefaultTenantId"];
            if (Guid.TryParse(tenantIdStr, out var fallbackId))
                return fallbackId;
        }

        return null;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<(string? PhoneNumberId, string? AccessToken)> GetCredentialsAsync(CancellationToken ct)
    {
        // 1. Try DB credentials (tenant set them in the dashboard)
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == _tenantContext.CurrentTenantId, ct);

        if (business != null
            && !string.IsNullOrEmpty(business.WhatsAppPhoneNumberId)
            && !string.IsNullOrEmpty(business.WhatsAppAccessToken))
        {
            return (business.WhatsAppPhoneNumberId, business.WhatsAppAccessToken);
        }

        // 2. Fallback to appsettings.json (dev / single-tenant)
        if (!string.IsNullOrEmpty(_configPhoneNumberId) && !string.IsNullOrEmpty(_configAccessToken))
            return (_configPhoneNumberId, _configAccessToken);

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
                _logger.LogError("WhatsApp API error {Status}: {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send WhatsApp message to {Url}", url);
        }
    }

    private static string NormalizePhone(string phone)
        => new string(phone.Where(char.IsDigit).ToArray());
}
