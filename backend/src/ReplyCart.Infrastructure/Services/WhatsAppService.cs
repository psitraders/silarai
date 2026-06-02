using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// WhatsApp Business Cloud API implementation (graph.facebook.com).
/// Per-tenant credentials: each merchant connects their own WhatsApp Business number
/// via Meta Embedded Signup. PhoneNumberId + AccessToken are stored in the Businesses table.
/// </summary>
public class WhatsAppService : IWhatsAppService
{
    private const string ApiVersion = "v25.0";
    private const string GraphBase  = "https://graph.facebook.com";

    private readonly HttpClient _http;
    private readonly ILogger<WhatsAppService> _logger;
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;

    public WhatsAppService(
        IHttpClientFactory httpClientFactory,
        ILogger<WhatsAppService> logger,
        AppDbContext db,
        ITenantContext tenantContext)
    {
        _http           = httpClientFactory.CreateClient();
        _logger         = logger;
        _db             = db;
        _tenantContext  = tenantContext;
    }

    public bool IsConfigured
    {
        get
        {
            var business = _db.Businesses
                .FirstOrDefault(b => b.TenantId == _tenantContext.CurrentTenantId);
            return !string.IsNullOrEmpty(business?.WhatsAppPhoneNumberId)
                && !string.IsNullOrEmpty(business?.WhatsAppAccessToken);
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /// <inheritdoc/>
    public async Task SendTextMessageAsync(string toPhone, string message, CancellationToken ct = default)
    {
        var (phoneNumberId, accessToken) = await GetCredentialsAsync(ct);
        if (phoneNumberId == null || accessToken == null) return;

        var payload = new
        {
            messaging_product = "whatsapp",
            to   = NormalizePhone(toPhone),
            type = "text",
            text = new { body = message },
        };

        await PostAsync(MessagesUrl(phoneNumberId), payload, accessToken, ct);
    }

    /// <inheritdoc />
    public async Task SendTemplateMessageAsync(
        string toPhone,
        string templateName,
        string languageCode,
        IEnumerable<string>? bodyParams = null,
        CancellationToken ct = default)
    {
        var (phoneNumberId, accessToken) = await GetCredentialsAsync(ct);
        if (phoneNumberId == null || accessToken == null) return;

        var payload = BuildTemplatePayload(toPhone, templateName, languageCode, bodyParams);
        await PostAsync(MessagesUrl(phoneNumberId), payload, accessToken, ct);
    }

    /// <inheritdoc/>
    public async Task<int> BroadcastTextMessageAsync(
        IEnumerable<string?> phones,
        string message,
        CancellationToken ct = default)
    {
        var (phoneNumberId, accessToken) = await GetCredentialsAsync(ct);
        if (phoneNumberId == null || accessToken == null) return 0;

        var url  = MessagesUrl(phoneNumberId);
        var sent = 0;

        foreach (var phone in phones.Where(p => !string.IsNullOrWhiteSpace(p)))
        {
            ct.ThrowIfCancellationRequested();
            try
            {
                var payload = new
                {
                    messaging_product = "whatsapp",
                    to   = NormalizePhone(phone!),
                    type = "text",
                    text = new { body = message },
                };
                await PostAsync(url, payload, accessToken, ct);
                sent++;
                await Task.Delay(60, ct); // ~16 msg/s — well within Meta's 80/s limit
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Broadcast: failed to send to {Phone}", phone);
            }
        }
        return sent;
    }

    /// <inheritdoc/>
    public async Task<int> BroadcastCampaignAsync(
        IEnumerable<(string Phone, string Name)> recipients,
        string templateName,
        string languageCode = "en_US",
        IEnumerable<string>? bodyParams = null,
        CancellationToken ct = default)
    {
        var (phoneNumberId, accessToken) = await GetCredentialsAsync(ct);
        if (phoneNumberId == null || accessToken == null) return 0;

        var url  = MessagesUrl(phoneNumberId);
        var sent = 0;

        foreach (var (phone, _) in recipients)
        {
            ct.ThrowIfCancellationRequested();
            try
            {
                var payload = BuildTemplatePayload(phone, templateName, languageCode, bodyParams);
                var ok = await PostAsync(url, payload, accessToken, ct);
                if (ok) sent++;
                await Task.Delay(60, ct);
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Template broadcast: failed to send to {Phone}", phone);
            }
        }
        return sent;
    }

    /// <inheritdoc/>
    public async Task<Guid?> ResolveTenantByPhoneNumberIdAsync(string phoneNumberId, CancellationToken ct = default)
    {
        var business = await _db.Businesses
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                b => !b.IsDeleted && b.WhatsAppPhoneNumberId == phoneNumberId,
                ct);
        return business?.TenantId;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string MessagesUrl(string phoneNumberId)
        => $"{GraphBase}/{ApiVersion}/{phoneNumberId}/messages";

    private async Task<(string? PhoneNumberId, string? AccessToken)> GetCredentialsAsync(CancellationToken ct)
    {
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == _tenantContext.CurrentTenantId, ct);

        if (!string.IsNullOrEmpty(business?.WhatsAppPhoneNumberId)
         && !string.IsNullOrEmpty(business?.WhatsAppAccessToken))
            return (business.WhatsAppPhoneNumberId, business.WhatsAppAccessToken);

        _logger.LogWarning(
            "WhatsApp not connected for tenant {TenantId}. Skipping send.",
            _tenantContext.CurrentTenantId);
        return (null, null);
    }

    private static object BuildTemplatePayload(
        string phone,
        string templateName,
        string languageCode,
        IEnumerable<string>? bodyParams)
    {
        var paramsList = bodyParams?.ToList() ?? [];

        if (paramsList.Count > 0)
        {
            return new
            {
                messaging_product = "whatsapp",
                to       = NormalizePhone(phone),
                type     = "template",
                template = new
                {
                    name     = templateName,
                    language = new { code = languageCode },
                    components = new[]
                    {
                        new
                        {
                            type       = "body",
                            parameters = paramsList.Select(p => new { type = "text", text = p }).ToArray(),
                        },
                    },
                },
            };
        }

        return new
        {
            messaging_product = "whatsapp",
            to       = NormalizePhone(phone),
            type     = "template",
            template = new
            {
                name     = templateName,
                language = new { code = languageCode },
            },
        };
    }

    private async Task<bool> PostAsync(string url, object payload, string accessToken, CancellationToken ct)
    {
        try
        {
            var json    = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            req.Content = content;

            var resp = await _http.SendAsync(req, ct);
            var body = await resp.Content.ReadAsStringAsync(ct);

            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogError("Meta WhatsApp API error {Status}: {Body}", resp.StatusCode, body);
                return false;
            }

            _logger.LogInformation("Meta WhatsApp API success: {Body}", body);
            return true;
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to post to Meta WhatsApp endpoint {Url}", url);
            return false;
        }
    }

    private static string NormalizePhone(string phone)
        => new string(phone.Where(char.IsDigit).ToArray());
}
