using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ReplyCart.Application.Common.Helpers;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

public class RazorpayService(IHttpClientFactory httpClientFactory) : IRazorpayService
{
    public async Task<string> CreatePaymentLinkAsync(
        string   keyId,
        string   keySecret,
        string   currency,
        Guid     orderId,
        string   orderNumber,
        decimal  amount,
        string?  customerName,
        string?  customerPhone,
        string   businessName,
        CancellationToken cancellationToken = default)
    {
        var amountSubunits = CurrencyHelper.ToSubunits(amount, currency);

        var payload = new
        {
            amount          = amountSubunits,
            currency        = currency.ToUpperInvariant(),
            accept_partial  = false,
            description     = $"Order {orderNumber} — {businessName}",
            customer        = new
            {
                name    = customerName ?? "Customer",
                contact = NormalizePhone(customerPhone),
            },
            notify          = new { sms = true, email = false },
            reminder_enable = true,
            notes           = new Dictionary<string, string>
            {
                ["order_id"]     = orderId.ToString(),
                ["order_number"] = orderNumber,
            },
        };

        var json    = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var client  = httpClientFactory.CreateClient("Razorpay");

        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{keyId}:{keySecret}"));

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/payment_links");
        req.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        req.Content = content;

        var response     = await client.SendAsync(req, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            string razorpayError;
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                razorpayError = doc.RootElement.GetProperty("error").GetProperty("description").GetString() ?? responseBody;
            }
            catch { razorpayError = responseBody; }
            throw new InvalidOperationException($"Razorpay error: {razorpayError}");
        }

        using var resDoc = JsonDocument.Parse(responseBody);
        return resDoc.RootElement.GetProperty("short_url").GetString()
            ?? throw new InvalidOperationException("Razorpay response did not contain a payment link URL.");
    }

    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return null;
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        // Only auto-prepend 91 for 10-digit Indian numbers (no country code provided)
        if (digits.Length == 10) digits = "91" + digits;
        return digits;
    }
}


