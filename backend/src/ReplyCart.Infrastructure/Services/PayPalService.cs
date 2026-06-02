using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// Creates a PayPal Invoice, sends it, and returns the payer-view link (shareable payment URL).
/// Uses the PayPal Invoicing v2 API.
/// </summary>
public class PayPalService(IHttpClientFactory httpClientFactory) : IPayPalService
{
    public async Task<string> CreateInvoiceLinkAsync(
        string  clientId,
        string  clientSecret,
        bool    useSandbox,
        string  currency,
        Guid    orderId,
        string  orderNumber,
        decimal amount,
        string? customerName,
        string? customerEmail,
        string  businessName,
        CancellationToken cancellationToken = default)
    {
        var baseUrl = useSandbox
            ? "https://api-m.sandbox.paypal.com"
            : "https://api-m.paypal.com";

        var client = httpClientFactory.CreateClient("PayPal");

        // ── Step 1: Get OAuth access token ────────────────────────────────────
        var accessToken = await GetAccessTokenAsync(client, baseUrl, clientId, clientSecret, cancellationToken);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // ── Step 2: Create invoice draft ──────────────────────────────────────
        var invoiceDate = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var invoicePayload = new
        {
            detail = new
            {
                invoice_number = orderNumber,
                invoice_date   = invoiceDate,
                currency_code  = currency.ToUpperInvariant(),
                note           = $"Order #{orderNumber} from {businessName}",
            },
            invoicer = new
            {
                name = new { business_name = businessName }
            },
            primary_recipients = string.IsNullOrWhiteSpace(customerEmail)
                ? null
                : new[] { new { billing_info = new { email_address = customerEmail, name = new { full_name = customerName ?? "Customer" } } } },
            items = new[]
            {
                new
                {
                    name         = $"Order #{orderNumber}",
                    description  = businessName,
                    quantity     = "1",
                    unit_amount  = new { currency_code = currency.ToUpperInvariant(), value = amount.ToString("F2") },
                    unit_of_measure = "QUANTITY",
                }
            },
        };

        var createJson    = JsonSerializer.Serialize(invoicePayload, new JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
        var createContent = new StringContent(createJson, Encoding.UTF8, "application/json");

        using var createReq = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v2/invoicing/invoices");
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        createReq.Content = createContent;

        var createResp = await client.SendAsync(createReq, cancellationToken);
        var createBody = await createResp.Content.ReadAsStringAsync(cancellationToken);

        if (!createResp.IsSuccessStatusCode)
            throw new InvalidOperationException($"PayPal create invoice error: {createBody}");

        // Get invoice ID from Location header or response body
        string invoiceId;
        if (createResp.Headers.Location != null)
        {
            invoiceId = createResp.Headers.Location.AbsolutePath.Split('/').Last();
        }
        else
        {
            using var createDoc = JsonDocument.Parse(createBody);
            invoiceId = createDoc.RootElement.GetProperty("id").GetString()
                ?? throw new InvalidOperationException("PayPal did not return an invoice ID.");
        }

        // ── Step 3: Send the invoice (makes it payable) ───────────────────────
        using var sendReq = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v2/invoicing/invoices/{invoiceId}/send");
        sendReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        sendReq.Content = new StringContent("{}", Encoding.UTF8, "application/json");
        await client.SendAsync(sendReq, cancellationToken); // fire-and-forget errors — invoice is still accessible

        // ── Step 4: Get payer-view link ───────────────────────────────────────
        using var getReq = new HttpRequestMessage(HttpMethod.Get, $"{baseUrl}/v2/invoicing/invoices/{invoiceId}");
        getReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var getResp = await client.SendAsync(getReq, cancellationToken);
        var getBody = await getResp.Content.ReadAsStringAsync(cancellationToken);

        if (!getResp.IsSuccessStatusCode)
            throw new InvalidOperationException($"PayPal get invoice error: {getBody}");

        using var getDoc = JsonDocument.Parse(getBody);
        if (getDoc.RootElement.TryGetProperty("links", out var links))
        {
            foreach (var link in links.EnumerateArray())
            {
                if (link.TryGetProperty("rel", out var rel) && rel.GetString() == "payer-view")
                    return link.GetProperty("href").GetString()!;
            }
        }

        // Fallback: construct the URL directly
        return useSandbox
            ? $"https://www.sandbox.paypal.com/invoice/p/#{invoiceId}"
            : $"https://www.paypal.com/invoice/p/#{invoiceId}";
    }

    private static async Task<string> GetAccessTokenAsync(
        HttpClient client, string baseUrl,
        string clientId, string clientSecret,
        CancellationToken cancellationToken)
    {
        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{clientId}:{clientSecret}"));

        using var tokenReq = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v1/oauth2/token");
        tokenReq.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        tokenReq.Content = new FormUrlEncodedContent(new[] { new KeyValuePair<string, string>("grant_type", "client_credentials") });

        var tokenResp = await client.SendAsync(tokenReq, cancellationToken);
        var tokenBody = await tokenResp.Content.ReadAsStringAsync(cancellationToken);

        if (!tokenResp.IsSuccessStatusCode)
            throw new InvalidOperationException($"PayPal OAuth error: {tokenBody}");

        using var tokenDoc = JsonDocument.Parse(tokenBody);
        return tokenDoc.RootElement.GetProperty("access_token").GetString()
            ?? throw new InvalidOperationException("PayPal OAuth did not return an access token.");
    }
}
