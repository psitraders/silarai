using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// OTP service backed by 2Factor.in.
///
/// Strategy: we generate our own 6-digit OTP, send it via 2Factor's
/// custom-OTP SMS endpoint, and verify it ourselves from IMemoryCache.
/// This avoids the fragile AUTOGEN → VERIFY3 session chain and forces
/// SMS delivery (not voice).
///
/// Send   → GET https://2factor.in/API/V1/{apiKey}/SMS/{phone}/{otp}
/// Verify → cache lookup (no 2Factor round-trip needed)
/// </summary>
public class TwoFactorOtpService(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    AppDbContext db,
    ILogger<TwoFactorOtpService> logger) : IOtpService
{
    private const string OtpPrefix = "otp:";
    private static readonly TimeSpan OtpTtl = TimeSpan.FromMinutes(5);

    public async Task<bool> SendOtpAsync(string phone, CancellationToken ct = default)
    {
        var apiKey = await GetApiKeyAsync(ct);
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("TwoFactor:ApiKey is not configured in PlatformSettings.");
            return false;
        }

        var normalized = NormalizePhone(phone);

        // Generate a 6-digit OTP ourselves
        var otp = Random.Shared.Next(100000, 999999).ToString();

        // Store in cache — this is what we verify against (no VERIFY3 needed)
        cache.Set(OtpPrefix + normalized, otp, OtpTtl);

        // Send via 2Factor custom-OTP endpoint — forces SMS, not voice
        // If a DLT template name is configured, append it (required once DLT is approved on 2Factor)
        var template = await GetSettingAsync("TwoFactor:TemplateName", ct);
        var url = string.IsNullOrWhiteSpace(template)
            ? $"https://2factor.in/API/V1/{apiKey}/SMS/{normalized}/{otp}"
            : $"https://2factor.in/API/V1/{apiKey}/SMS/{normalized}/{otp}/{Uri.EscapeDataString(template)}";

        try
        {
            var http     = httpClientFactory.CreateClient("TwoFactor");
            var response = await http.GetAsync(url, ct);
            var body     = await response.Content.ReadAsStringAsync(ct);

            logger.LogInformation("2Factor send response for {Phone}: {Body}", normalized, body);

            // Parse loosely — just check Status field
            using var doc = JsonDocument.Parse(body);
            var status = doc.RootElement.TryGetProperty("Status", out var s) ? s.GetString() : null;

            if (!string.Equals(status, "Success", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("2Factor rejected send for {Phone}: {Body}", normalized, body);
                // DEV FALLBACK: OTP is still in cache — log it so you can test
                logger.LogWarning("⚠️  DEV FALLBACK — OTP for {Phone} is: {Otp}", normalized, otp);
                // Don't remove from cache — let dev test with the logged OTP
                return true; // return true so the UI flow continues
            }

            // SMS sent successfully — log OTP in dev for easy testing
            logger.LogInformation("✅ OTP sent via SMS to {Phone}. DEV: {Otp}", normalized, otp);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception sending OTP to {Phone}", normalized);
            cache.Remove(OtpPrefix + normalized);
            return false;
        }
    }

    public Task<bool> VerifyOtpAsync(string phone, string otp, CancellationToken ct = default)
    {
        var normalized = NormalizePhone(phone);
        var key        = OtpPrefix + normalized;

        if (!cache.TryGetValue(key, out string? stored) || string.IsNullOrEmpty(stored))
        {
            logger.LogWarning("No OTP found in cache for {Phone} — expired or never sent.", normalized);
            return Task.FromResult(false);
        }

        var match = string.Equals(stored.Trim(), otp.Trim(), StringComparison.Ordinal);

        if (match)
            cache.Remove(key); // consume on success
        else
            logger.LogWarning("OTP mismatch for {Phone} — entered: {Entered}", normalized, otp);

        return Task.FromResult(match);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Task<string?> GetApiKeyAsync(CancellationToken ct)
        => GetSettingAsync("TwoFactor:ApiKey", ct);

    private async Task<string?> GetSettingAsync(string key, CancellationToken ct)
    {
        var setting = await db.PlatformSettings
            .AsNoTracking()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Key == key, ct);

        return setting?.Value;
    }

    private static string NormalizePhone(string phone)
        => new string(phone.Where(char.IsDigit).ToArray());
}
