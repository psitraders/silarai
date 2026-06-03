using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ReplyCart.Application.Common.Helpers;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// Creates a Stripe Checkout Session and returns the hosted checkout URL.
/// Uses form-encoded requests (Stripe does not accept JSON for most endpoints).
/// </summary>
public class StripeService(IHttpClientFactory httpClientFactory) : IStripeService
{
    private const string BaseUrl = "https://api.stripe.com/v1";

    public async Task<string> CreateCheckoutSessionAsync(
        string   secretKey,
        string   currency,
        Guid     orderId,
        string   orderNumber,
        decimal  amount,
        string?  customerEmail,
        string   businessName,
        CancellationToken cancellationToken = default)
    {
        var amountSubunits = CurrencyHelper.ToSubunits(amount, currency);

        // Stripe uses form-encoded bodies
        var formData = new List<KeyValuePair<string, string>>
        {
            new("mode",                                              "payment"),
            new("success_url",                                       "https://app.replycart.com/orders"),
            new("cancel_url",                                        "https://app.replycart.com/orders"),
            new("line_items[0][quantity]",                           "1"),
            new("line_items[0][price_data][currency]",               currency.ToLowerInvariant()),
            new("line_items[0][price_data][unit_amount]",            amountSubunits.ToString()),
            new("line_items[0][price_data][product_data][name]",     $"Order #{orderNumber}"),
            new("line_items[0][price_data][product_data][description]", $"{businessName}"),
            new("metadata[order_id]",                                orderId.ToString()),
            new("metadata[order_number]",                            orderNumber),
        };

        if (!string.IsNullOrWhiteSpace(customerEmail))
            formData.Add(new("customer_email", customerEmail));

        var client = httpClientFactory.CreateClient("Stripe");

        using var req = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/checkout/sessions");
        req.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer", secretKey);
        req.Content = new FormUrlEncodedContent(formData);

        var response     = await client.SendAsync(req, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            string stripeError;
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                stripeError = doc.RootElement
                    .TryGetProperty("error", out var err)
                    ? err.TryGetProperty("message", out var msg) ? msg.GetString() ?? responseBody : responseBody
                    : responseBody;
            }
            catch { stripeError = responseBody; }
            throw new InvalidOperationException($"Stripe error: {stripeError}");
        }

        using var resDoc = JsonDocument.Parse(responseBody);
        return resDoc.RootElement.GetProperty("url").GetString()
            ?? throw new InvalidOperationException("Stripe response did not contain a checkout URL.");
    }
}


