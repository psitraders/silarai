using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// OTP service backed by Twilio Verify — works globally, no per-country routing needed.
///
/// Send   → POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications
/// Check  → POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationChecks
///
/// Config keys (set in Azure App Service → Configuration):
///   Twilio__AccountSid        (AC...)
///   Twilio__AuthToken         (32-char hex)
///   Twilio__VerifyServiceSid  (VA...)
/// </summary>
public class TwilioOtpService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<TwilioOtpService> logger) : IOtpService
{
    private readonly string _accountSid    = configuration["Twilio:AccountSid"]       ?? "";
    private readonly string _authToken     = configuration["Twilio:AuthToken"]        ?? "";
    private readonly string _serviceSid    = configuration["Twilio:VerifyServiceSid"] ?? "";

    private const string BaseUrl = "https://verify.twilio.com/v2/Services";

    public async Task<bool> SendOtpAsync(string phone, CancellationToken ct = default)
    {
        if (!IsConfigured())
        {
            logger.LogWarning("Twilio is not configured — OTP send skipped.");
            return false;
        }

        var e164 = ToE164(phone);
        try
        {
            var response = await CreateClient().PostAsync(
                $"{BaseUrl}/{_serviceSid}/Verifications",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["To"]      = e164,
                    ["Channel"] = "sms",
                }),
                ct);

            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogInformation("Twilio Verify send → {Phone} | {Status} | {Body}", e164, (int)response.StatusCode, body);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Twilio Verify send exception for {Phone}", e164);
            return false;
        }
    }

    public async Task<bool> VerifyOtpAsync(string phone, string otp, CancellationToken ct = default)
    {
        if (!IsConfigured())
        {
            logger.LogWarning("Twilio is not configured — OTP verify skipped.");
            return false;
        }

        var e164 = ToE164(phone);
        try
        {
            var response = await CreateClient().PostAsync(
                $"{BaseUrl}/{_serviceSid}/VerificationChecks",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["To"]   = e164,
                    ["Code"] = otp.Trim(),
                }),
                ct);

            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogInformation("Twilio Verify check → {Phone} | {Status} | {Body}", e164, (int)response.StatusCode, body);

            if (!response.IsSuccessStatusCode) return false;

            using var doc = JsonDocument.Parse(body);
            var status = doc.RootElement.TryGetProperty("status", out var s) ? s.GetString() : null;
            return string.Equals(status, "approved", StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Twilio Verify check exception for {Phone}", e164);
            return false;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private bool IsConfigured() =>
        !string.IsNullOrEmpty(_accountSid) &&
        !string.IsNullOrEmpty(_authToken)  &&
        !string.IsNullOrEmpty(_serviceSid);

    private HttpClient CreateClient()
    {
        var http = httpClientFactory.CreateClient("Twilio");
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_accountSid}:{_authToken}")));
        return http;
    }

    /// <summary>
    /// Converts any phone string to E.164 (+XXXXXXXXXXX).
    /// - 10 digits starting with 6–9  →  Indian mobile  →  +91XXXXXXXXXX
    /// - Anything else                →  already has country code  →  +{digits}
    /// </summary>
    private static string ToE164(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());

        if (digits.Length == 10 && digits[0] >= '6' && digits[0] <= '9')
            return $"+91{digits}";

        return $"+{digits}";
    }
}
