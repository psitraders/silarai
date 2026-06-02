using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Domain.Chatbot;
using ReplyCart.Infrastructure.Persistence;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/admin/chatbot-clients")]
[Authorize(Roles = "SuperAdmin")]
public class AdminChatbotClientsController(
    AppDbContext db,
    IHttpClientFactory httpClientFactory,
    ILogger<AdminChatbotClientsController> logger) : ControllerBase
{
    // ── List all clients ──────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var clients = await db.ChatbotClients
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id, c.Name, c.BusinessDesc, c.ApiKey, c.Currency,
                c.ContactEmail, c.ContactPhone, c.WebhookUrl,
                c.WelcomeMessage, c.IsActive, c.CreatedAt,
                ProductCount = db.ChatbotProducts.Count(p => p.ClientId == c.Id),
            })
            .ToListAsync(ct);

        return Ok(clients);
    }

    // ── Get single client with products ──────────────────────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var client = await db.ChatbotClients
            .Where(c => c.Id == id)
            .Select(c => new
            {
                c.Id, c.Name, c.BusinessDesc, c.ApiKey, c.Currency, c.Language,
                c.ContactEmail, c.ContactPhone, c.WebhookUrl, c.LogoUrl,
                c.WelcomeMessage, c.IsActive, c.CreatedAt,
                // WhatsApp
                c.WaPhoneNumberId, c.WaAccessToken, c.WaPhoneNumber, c.WaBusinessId,
                // Facebook
                c.FbPageId, c.FbPageAccessToken,
                // Instagram
                c.IgAccountId, c.IgAccessToken,
                // Shopify
                c.ShopifyDomain, c.ShopifyApiKey, c.LastShopifySync,
                Products = db.ChatbotProducts
                    .Where(p => p.ClientId == c.Id)
                    .OrderBy(p => p.Category).ThenBy(p => p.Title)
                    .Select(p => new
                    {
                        p.Id, p.Title, p.Description, p.Price, p.SalePrice,
                        p.Variants, p.ImageUrl, p.Category, p.IsAvailable,
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync(ct);

        if (client == null) return NotFound(new { message = "Client not found." });
        return Ok(client);
    }

    // ── Create new client ─────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertChatbotClientRequest req, CancellationToken ct)
    {
        var apiKey = $"rc_bot_{Guid.NewGuid():N}";

        var client = new ChatbotClient
        {
            Id             = Guid.NewGuid(),
            Name           = req.Name.Trim(),
            BusinessDesc   = req.BusinessDesc?.Trim() ?? string.Empty,
            ApiKey         = apiKey,
            Currency       = req.Currency ?? "INR",
            Language       = req.Language ?? "en",
            WebhookUrl     = req.WebhookUrl?.Trim(),
            ContactEmail   = req.ContactEmail?.Trim(),
            ContactPhone   = req.ContactPhone?.Trim(),
            LogoUrl        = req.LogoUrl?.Trim(),
            WelcomeMessage = req.WelcomeMessage?.Trim(),
            IsActive       = true,
            CreatedAt      = DateTime.UtcNow,
        };

        db.ChatbotClients.Add(client);
        await db.SaveChangesAsync(ct);

        return Ok(new { client.Id, client.ApiKey });
    }

    // ── Update client settings ────────────────────────────────────────────────
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertChatbotClientRequest req, CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });

        client.Name             = req.Name.Trim();
        client.BusinessDesc     = req.BusinessDesc?.Trim() ?? string.Empty;
        client.Currency         = req.Currency ?? "INR";
        client.Language         = req.Language ?? "en";
        client.WebhookUrl       = req.WebhookUrl?.Trim();
        client.ContactEmail     = req.ContactEmail?.Trim();
        client.ContactPhone     = req.ContactPhone?.Trim();
        client.LogoUrl          = req.LogoUrl?.Trim();
        client.WelcomeMessage   = req.WelcomeMessage?.Trim();
        // WhatsApp
        client.WaPhoneNumberId  = req.WaPhoneNumberId?.Trim();
        client.WaAccessToken    = req.WaAccessToken?.Trim();
        client.WaPhoneNumber    = req.WaPhoneNumber?.Trim();
        client.WaBusinessId     = req.WaBusinessId?.Trim();
        // Facebook
        client.FbPageId          = req.FbPageId?.Trim();
        client.FbPageAccessToken = req.FbPageAccessToken?.Trim();
        // Instagram
        client.IgAccountId      = req.IgAccountId?.Trim();
        client.IgAccessToken    = req.IgAccessToken?.Trim();
        // Shopify
        client.ShopifyDomain    = req.ShopifyDomain?.Trim();
        client.ShopifyApiKey    = req.ShopifyApiKey?.Trim();
        client.UpdatedAt        = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── CSV product import ────────────────────────────────────────────────────
    /// <summary>
    /// Upload a CSV file with columns: title, description, price, sale_price, category, variants, image_url
    /// Header row is required. Replaces all existing products.
    /// </summary>
    [HttpPost("{id:guid}/import-csv")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportCsv(Guid id, IFormFile file, CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });
        if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });

        var products = new List<ChatbotProduct>();
        using var reader = new System.IO.StreamReader(file.OpenReadStream());
        var header = await reader.ReadLineAsync(ct);
        if (header == null) return BadRequest(new { message = "Empty file." });

        // Map header columns (proper RFC-4180 parser handles quoted fields with commas)
        var cols = SplitCsvLine(header).Select(h => h.Trim().ToLower()).ToArray();
        int Col(string name) => Array.IndexOf(cols, name);
        string Cell(string[] parts, int idx) =>
            idx >= 0 && idx < parts.Length ? parts[idx].Trim() : string.Empty;

        string? line;
        while ((line = await reader.ReadLineAsync(ct)) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            var parts = SplitCsvLine(line);
            var title = Cell(parts, Col("title"));
            if (string.IsNullOrWhiteSpace(title)) continue;

            decimal.TryParse(Cell(parts, Col("price")), NumberStyles.Any, CultureInfo.InvariantCulture, out var price);
            decimal.TryParse(Cell(parts, Col("sale_price")), NumberStyles.Any, CultureInfo.InvariantCulture, out var salePrice);

            products.Add(new ChatbotProduct
            {
                Id          = Guid.NewGuid(),
                ClientId    = id,
                Title       = title,
                Description = Cell(parts, Col("description")),
                Price       = price,
                SalePrice   = salePrice > 0 ? salePrice : null,
                Category    = Cell(parts, Col("category")),
                Variants    = Cell(parts, Col("variants")),
                ImageUrl    = Cell(parts, Col("image_url")),
                IsAvailable = true,
                CreatedAt   = DateTime.UtcNow,
            });
        }

        // Replace all existing
        var existing = await db.ChatbotProducts.Where(p => p.ClientId == id).ToListAsync(ct);
        db.ChatbotProducts.RemoveRange(existing);
        db.ChatbotProducts.AddRange(products);
        await db.SaveChangesAsync(ct);

        return Ok(new { imported = products.Count });
    }

    // ── Shopify catalog sync ──────────────────────────────────────────────────
    [HttpPost("{id:guid}/sync-shopify")]
    public async Task<IActionResult> SyncShopify(Guid id, CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });

        if (string.IsNullOrWhiteSpace(client.ShopifyDomain) || string.IsNullOrWhiteSpace(client.ShopifyApiKey))
            return BadRequest(new { message = "Shopify domain and API key must be configured first." });

        try
        {
            var http = httpClientFactory.CreateClient();
            var url  = $"https://{client.ShopifyDomain}/admin/api/2024-01/products.json?limit=250&status=active";
            var req  = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.Add("X-Shopify-Access-Token", client.ShopifyApiKey);
            var resp = await http.SendAsync(req, ct);

            if (!resp.IsSuccessStatusCode)
                return BadRequest(new { message = $"Shopify API error: {resp.StatusCode}" });

            var json = await resp.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            var shopifyProducts = doc.RootElement.GetProperty("products");

            var products = new List<ChatbotProduct>();
            foreach (var p in shopifyProducts.EnumerateArray())
            {
                var title = p.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                var desc  = p.TryGetProperty("body_html", out var d) ? StripHtml(d.GetString() ?? "") : "";
                var img   = p.TryGetProperty("image", out var imgProp) && imgProp.ValueKind != JsonValueKind.Null
                    ? imgProp.TryGetProperty("src", out var src) ? src.GetString() : null : null;
                var category = p.TryGetProperty("product_type", out var pt) ? pt.GetString() : null;

                // Get price from first variant
                decimal price = 0;
                if (p.TryGetProperty("variants", out var variants) && variants.GetArrayLength() > 0)
                {
                    var firstVariant = variants[0];
                    if (firstVariant.TryGetProperty("price", out var priceEl))
                        decimal.TryParse(priceEl.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out price);
                }

                // Collect variant names
                var variantNames = new List<string>();
                if (p.TryGetProperty("options", out var options))
                {
                    foreach (var opt in options.EnumerateArray())
                    {
                        if (opt.TryGetProperty("values", out var vals))
                            variantNames.AddRange(vals.EnumerateArray()
                                .Select(v => v.GetString() ?? "").Where(v => v != "Default Title"));
                    }
                }

                if (string.IsNullOrWhiteSpace(title)) continue;
                products.Add(new ChatbotProduct
                {
                    Id          = Guid.NewGuid(),
                    ClientId    = id,
                    Title       = title,
                    Description = desc.Length > 300 ? desc[..300] : desc,
                    Price       = price,
                    Category    = category,
                    ImageUrl    = img,
                    Variants    = variantNames.Count > 0 ? string.Join(", ", variantNames.Distinct()) : null,
                    IsAvailable = true,
                    CreatedAt   = DateTime.UtcNow,
                });
            }

            // Replace all
            var existing = await db.ChatbotProducts.Where(pr => pr.ClientId == id).ToListAsync(ct);
            db.ChatbotProducts.RemoveRange(existing);
            db.ChatbotProducts.AddRange(products);
            client.LastShopifySync = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);

            return Ok(new { synced = products.Count, syncedAt = client.LastShopifySync });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Shopify sync failed for client {Id}", id);
            return StatusCode(500, new { message = "Shopify sync failed. Check credentials." });
        }
    }

    /// <summary>
    /// RFC-4180 compliant CSV line splitter.
    /// Handles quoted fields that contain commas, quotes, or newlines.
    /// </summary>
    private static string[] SplitCsvLine(string line)
    {
        var fields = new List<string>();
        int i = 0;
        while (i <= line.Length)
        {
            string field;
            if (i < line.Length && line[i] == '"')
            {
                // Quoted field
                i++; // skip opening quote
                var sb = new System.Text.StringBuilder();
                while (i < line.Length)
                {
                    if (line[i] == '"')
                    {
                        i++;
                        if (i < line.Length && line[i] == '"') { sb.Append('"'); i++; } // escaped quote
                        else break; // closing quote
                    }
                    else { sb.Append(line[i++]); }
                }
                field = sb.ToString().Trim();
                if (i < line.Length && line[i] == ',') i++; // skip comma
            }
            else
            {
                // Unquoted field
                int start = i;
                while (i < line.Length && line[i] != ',') i++;
                field = line[start..i].Trim();
                if (i < line.Length) i++; // skip comma
            }
            fields.Add(field);
            if (i >= line.Length) break;
        }
        return fields.ToArray();
    }

    private static string StripHtml(string html)
    {
        return System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", " ").Trim();
    }

    // ── Toggle active status ──────────────────────────────────────────────────
    [HttpPut("{id:guid}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(Guid id, CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });

        client.IsActive  = !client.IsActive;
        client.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Regenerate API key ────────────────────────────────────────────────────
    [HttpPost("{id:guid}/regenerate-key")]
    public async Task<IActionResult> RegenerateKey(Guid id, CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });

        client.ApiKey    = $"rc_bot_{Guid.NewGuid():N}";
        client.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(new { client.ApiKey });
    }

    // ── Delete client ─────────────────────────────────────────────────────────
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });

        db.ChatbotClients.Remove(client);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Add / replace all products (bulk) ────────────────────────────────────
    [HttpPut("{id:guid}/products")]
    public async Task<IActionResult> BulkReplaceProducts(
        Guid id,
        [FromBody] List<UpsertChatbotProductRequest> products,
        CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });

        // Remove all existing products for this client
        var existing = await db.ChatbotProducts.Where(p => p.ClientId == id).ToListAsync(ct);
        db.ChatbotProducts.RemoveRange(existing);

        // Add new products
        foreach (var p in products)
        {
            db.ChatbotProducts.Add(new ChatbotProduct
            {
                Id          = Guid.NewGuid(),
                ClientId    = id,
                Title       = p.Title.Trim(),
                Description = p.Description?.Trim(),
                Price       = p.Price,
                SalePrice   = p.SalePrice,
                Variants    = p.Variants?.Trim(),
                ImageUrl    = p.ImageUrl?.Trim(),
                Category    = p.Category?.Trim(),
                IsAvailable = p.IsAvailable ?? true,
                CreatedAt   = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync(ct);
        return Ok(new { count = products.Count });
    }

    // ── Add single product ────────────────────────────────────────────────────
    [HttpPost("{id:guid}/products")]
    public async Task<IActionResult> AddProduct(
        Guid id,
        [FromBody] UpsertChatbotProductRequest req,
        CancellationToken ct)
    {
        var client = await db.ChatbotClients.FindAsync([id], ct);
        if (client == null) return NotFound(new { message = "Client not found." });

        var product = new ChatbotProduct
        {
            Id          = Guid.NewGuid(),
            ClientId    = id,
            Title       = req.Title.Trim(),
            Description = req.Description?.Trim(),
            Price       = req.Price,
            SalePrice   = req.SalePrice,
            Variants    = req.Variants?.Trim(),
            ImageUrl    = req.ImageUrl?.Trim(),
            Category    = req.Category?.Trim(),
            IsAvailable = req.IsAvailable ?? true,
            CreatedAt   = DateTime.UtcNow,
        };

        db.ChatbotProducts.Add(product);
        await db.SaveChangesAsync(ct);
        return Ok(new { product.Id });
    }

    // ── Delete single product ─────────────────────────────────────────────────
    [HttpDelete("{id:guid}/products/{productId:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, Guid productId, CancellationToken ct)
    {
        var product = await db.ChatbotProducts
            .FirstOrDefaultAsync(p => p.Id == productId && p.ClientId == id, ct);
        if (product == null) return NotFound();

        db.ChatbotProducts.Remove(product);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record UpsertChatbotClientRequest(
    string  Name,
    string? BusinessDesc,
    string? Currency,
    string? Language,
    string? WebhookUrl,
    string? ContactEmail,
    string? ContactPhone,
    string? LogoUrl,
    string? WelcomeMessage,
    // WhatsApp
    string? WaPhoneNumberId,
    string? WaAccessToken,
    string? WaPhoneNumber,
    string? WaBusinessId,
    // Facebook
    string? FbPageId,
    string? FbPageAccessToken,
    // Instagram
    string? IgAccountId,
    string? IgAccessToken,
    // Shopify
    string? ShopifyDomain,
    string? ShopifyApiKey
);

public record UpsertChatbotProductRequest(
    string   Title,
    string?  Description,
    decimal  Price,
    decimal? SalePrice,
    string?  Variants,
    string?  ImageUrl,
    string?  Category,
    bool?    IsAvailable
);
