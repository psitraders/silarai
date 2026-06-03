using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// Calls the Meta Commerce Manager Catalog Items Batch API
/// to upsert products into a WhatsApp Business Catalog.
/// </summary>
public class WhatsAppCatalogService(IHttpClientFactory httpClientFactory) : IWhatsAppCatalogService
{
    private const string GraphApiVersion = "v19.0";

    public async Task SyncItemsAsync(
        string catalogId,
        string accessToken,
        IReadOnlyList<WhatsAppCatalogItem> items,
        CancellationToken cancellationToken = default)
    {
        var requests = items.Select(item => new
        {
            method = "UPDATE",
            retailer_id = item.RetailerId,
            data = new
            {
                name          = item.Name,
                description   = item.Description,
                price         = item.PricePaise,       // smallest currency unit
                currency      = item.Currency,
                image_url     = item.ImageUrl,
                url           = item.ProductUrl,
                availability  = item.InStock ? "in stock" : "out of stock",
                brand         = item.Brand,
                condition     = "new",
            }
        }).ToList();

        var payload = new
        {
            allow_upsert = true,
            requests     = requests,
        };

        var json    = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = httpClientFactory.CreateClient("WhatsAppCatalog");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var url = $"https://graph.facebook.com/{GraphApiVersion}/{catalogId}/items_batch";

        using var httpReq = new HttpRequestMessage(HttpMethod.Post, url);
        httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        httpReq.Content = content;

        var response     = await client.SendAsync(httpReq, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            string apiError;
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                apiError = doc.RootElement
                    .TryGetProperty("error", out var errEl)
                    ? errEl.TryGetProperty("message", out var msgEl)
                        ? msgEl.GetString() ?? responseBody
                        : responseBody
                    : responseBody;
            }
            catch
            {
                apiError = responseBody;
            }
            throw new InvalidOperationException($"WhatsApp Catalog API error: {apiError}");
        }
    }

    public async Task<IReadOnlyList<WhatsAppCatalogItem>> FetchItemsAsync(
        string catalogId,
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var client  = httpClientFactory.CreateClient("WhatsAppCatalog");
        var results = new List<WhatsAppCatalogItem>();

        const string fields = "retailer_id,name,description,price,currency,image_url,url,availability,brand";
        string? nextUrl     = $"https://graph.facebook.com/{GraphApiVersion}/{catalogId}/products?fields={fields}&limit=200";

        while (nextUrl is not null)
        {
            using var req = new HttpRequestMessage(HttpMethod.Get, nextUrl);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var res  = await client.SendAsync(req, cancellationToken);
            var body = await res.Content.ReadAsStringAsync(cancellationToken);

            if (!res.IsSuccessStatusCode)
            {
                string errMsg;
                try
                {
                    using var errDoc = JsonDocument.Parse(body);
                    errMsg = errDoc.RootElement.TryGetProperty("error", out var e)
                             && e.TryGetProperty("message", out var m)
                        ? m.GetString() ?? body
                        : body;
                }
                catch { errMsg = body; }
                throw new InvalidOperationException($"Catalog fetch error: {errMsg}");
            }

            using var doc  = JsonDocument.Parse(body);
            var       root = doc.RootElement;

            if (root.TryGetProperty("data", out var data))
            {
                foreach (var item in data.EnumerateArray())
                {
                    string Str(string key)   => item.TryGetProperty(key, out var el) ? el.GetString() ?? "" : "";
                    var retailerId   = Str("retailer_id");
                    var name         = Str("name");
                    var description  = Str("description");
                    var priceRaw     = Str("price");      // e.g. "1000" (paise) or "10.00"
                    var currency     = Str("currency");
                    var imageUrl     = Str("image_url");
                    var productUrl   = Str("url");
                    var availability = Str("availability");
                    var brand        = Str("brand");

                    // Meta returns price in smallest currency unit (paise for INR, cents for USD)
                    // Strip any trailing currency suffix and parse
                    var priceNum = priceRaw.Split(' ')[0];
                    long.TryParse(priceNum, out var pricePaise);

                    results.Add(new WhatsAppCatalogItem(
                        RetailerId:  string.IsNullOrWhiteSpace(retailerId) ? Guid.NewGuid().ToString("N")[..8] : retailerId,
                        Name:        name,
                        Description: description,
                        PricePaise:  pricePaise,
                        Currency:    string.IsNullOrWhiteSpace(currency) ? "INR" : currency,
                        ImageUrl:    imageUrl,
                        ProductUrl:  productUrl,
                        InStock:     !string.Equals(availability, "out of stock", StringComparison.OrdinalIgnoreCase),
                        Brand:       brand));
                }
            }

            // Follow cursor pagination
            nextUrl = null;
            if (root.TryGetProperty("paging", out var paging) &&
                paging.TryGetProperty("next", out var next))
                nextUrl = next.GetString();
        }

        return results;
    }
}


