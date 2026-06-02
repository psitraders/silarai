using System.Collections.Concurrent;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// Thread-safe in-memory store for COD email OTPs.
/// Registered as a singleton so it survives across requests.
/// Each entry expires after 10 minutes and is deleted on first successful use.
/// </summary>
public sealed class CodOtpStore
{
    private record Entry(string Otp, DateTime ExpiresAt);

    // Key: normalised email (lower-case)
    private readonly ConcurrentDictionary<string, Entry> _store = new();

    /// <summary>Generate and store a 6-digit OTP for the given email. Returns the OTP.</summary>
    public string Generate(string email)
    {
        var key = email.Trim().ToLowerInvariant();
        var otp = Random.Shared.Next(100_000, 999_999).ToString();
        _store[key] = new Entry(otp, DateTime.UtcNow.AddMinutes(10));
        return otp;
    }

    /// <summary>
    /// Validates the OTP. Returns true and removes the entry on success.
    /// Returns false if the OTP is wrong, expired, or was never issued.
    /// </summary>
    public bool Verify(string email, string otp)
    {
        var key = email.Trim().ToLowerInvariant();
        if (!_store.TryGetValue(key, out var entry)) return false;
        if (DateTime.UtcNow > entry.ExpiresAt)   { _store.TryRemove(key, out _); return false; }
        if (entry.Otp != otp.Trim())              return false;

        _store.TryRemove(key, out _);             // one-time use
        return true;
    }
}
