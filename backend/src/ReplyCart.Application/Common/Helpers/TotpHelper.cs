using System.Security.Cryptography;

namespace ReplyCart.Application.Common.Helpers;

/// <summary>
/// RFC 6238 TOTP — 6-digit codes with 30-second step, SHA-1 HMAC.
/// Compatible with Google Authenticator, Authy, etc.
/// </summary>
public static class TotpHelper
{
    private const int Step = 30;
    private const int Digits = 6;

    /// <summary>Generate a cryptographically random 20-byte secret, Base32-encoded.</summary>
    public static string GenerateSecret()
    {
        var bytes = new byte[20];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Base32Encode(bytes);
    }

    /// <summary>Compute TOTP code for a Base32-encoded secret at the current time.</summary>
    public static string ComputeCode(string base32Secret)
        => ComputeCodeAt(base32Secret, DateTimeOffset.UtcNow);

    /// <summary>Verify a code; allows ±1 step window to tolerate clock drift.</summary>
    public static bool Verify(string base32Secret, string code)
    {
        var now = DateTimeOffset.UtcNow;
        for (var step = -1; step <= 1; step++)
        {
            if (ComputeCodeAt(base32Secret, now.AddSeconds(step * Step)) == code)
                return true;
        }
        return false;
    }

    /// <summary>Build an otpauth:// URI for QR code display.</summary>
    public static string GetOtpAuthUri(string secret, string accountName, string issuer = "ReplyCart")
    {
        var label = Uri.EscapeDataString($"{issuer}:{accountName}");
        return $"otpauth://totp/{label}?secret={secret}&issuer={Uri.EscapeDataString(issuer)}&algorithm=SHA1&digits=6&period=30";
    }

    // ─── private helpers ───────────────────────────────────────────────────────

    private static string ComputeCodeAt(string base32Secret, DateTimeOffset time)
    {
        var secretBytes = Base32Decode(base32Secret);
        var counter = time.ToUnixTimeSeconds() / Step;
        var counterBytes = BitConverter.GetBytes(counter);
        if (BitConverter.IsLittleEndian) Array.Reverse(counterBytes);

        using var hmac = new HMACSHA1(secretBytes);
        var hash = hmac.ComputeHash(counterBytes);

        var offset = hash[^1] & 0x0F;
        var code = ((hash[offset] & 0x7F) << 24)
                 | ((hash[offset + 1] & 0xFF) << 16)
                 | ((hash[offset + 2] & 0xFF) << 8)
                 |  (hash[offset + 3] & 0xFF);

        return (code % (int)Math.Pow(10, Digits)).ToString($"D{Digits}");
    }

    private static readonly char[] Base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".ToCharArray();

    private static string Base32Encode(byte[] data)
    {
        var sb = new System.Text.StringBuilder();
        int buffer = 0, bitsLeft = 0;
        foreach (var b in data)
        {
            buffer = (buffer << 8) | b;
            bitsLeft += 8;
            while (bitsLeft >= 5)
            {
                sb.Append(Base32Chars[(buffer >> (bitsLeft - 5)) & 0x1F]);
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0)
            sb.Append(Base32Chars[(buffer << (5 - bitsLeft)) & 0x1F]);
        return sb.ToString();
    }

    private static byte[] Base32Decode(string s)
    {
        s = s.TrimEnd('=').ToUpper();
        var output = new List<byte>();
        int buffer = 0, bitsLeft = 0;
        foreach (var c in s)
        {
            var idx = Array.IndexOf(Base32Chars, c);
            if (idx < 0) continue;
            buffer = (buffer << 5) | idx;
            bitsLeft += 5;
            if (bitsLeft >= 8)
            {
                output.Add((byte)(buffer >> (bitsLeft - 8)));
                bitsLeft -= 8;
            }
        }
        return [.. output];
    }
}
