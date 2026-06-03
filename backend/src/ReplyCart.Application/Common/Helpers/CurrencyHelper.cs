namespace ReplyCart.Application.Common.Helpers;

/// <summary>
/// Utilities for converting between decimal amounts and the smallest currency subunit
/// required by payment APIs (Razorpay, Stripe, PayPal).
/// </summary>
public static class CurrencyHelper
{
    /// <summary>
    /// Returns the multiplier to convert a decimal amount to the smallest currency unit.
    /// e.g. USD/INR/EUR → 100 (cents/paise), JPY/KRW → 1, KWD/BHD → 1000
    /// </summary>
    public static int GetSubunitMultiplier(string currency) =>
        currency.ToUpperInvariant() switch
        {
            // Zero-decimal currencies (1 unit = 1 unit, no sub-unit)
            "BIF" or "CLP" or "DJF" or "GNF" or "ISK" or "JPY" or "KMF" or
            "KRW" or "MGA" or "PYG" or "RWF" or "UGX" or "VND" or "VUV" or
            "XAF" or "XOF" or "XPF" => 1,

            // Three-decimal currencies
            "BHD" or "IQD" or "JOD" or "KWD" or "LYD" or "OMR" or "TND" => 1000,

            // Everything else (USD, EUR, GBP, INR, AUD, CAD, AED, SGD, MYR, etc.)
            _ => 100
        };

    /// <summary>Converts a decimal amount to the smallest unit (e.g. 10.50 USD → 1050).</summary>
    public static long ToSubunits(decimal amount, string currency)
        => (long)Math.Round(amount * GetSubunitMultiplier(currency));

    /// <summary>Converts smallest unit back to decimal (e.g. 1050 → 10.50 USD).</summary>
    public static decimal FromSubunits(long subunits, string currency)
        => subunits / (decimal)GetSubunitMultiplier(currency);
}


