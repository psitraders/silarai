using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.StorefrontBuilder;
using ReplyCart.Domain.Ai;
using ReplyCart.Domain.Enums;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Storefront builder — AI page generation (Phase 5b, SB-R23). The editor sends the merchant's prompt and a
/// compact catalogue of the section packs it has (packs live in frontend code, D2), so this endpoint stays
/// schema-agnostic (SB-R4): it adds store context, asks the model for sections JSON, gives them ids, drops
/// images and validates the result like any page layout. Nothing is saved — the editor previews the
/// result and the merchant applies it to the draft. Every call is logged in <c>AiUsageLogs</c>
/// (monthly AI count; not blocked yet).
/// </summary>
[ApiController]
[Route("api/v1/storefront-builder/ai")]
[Authorize]
public class StorefrontBuilderAiController(
    AppDbContext db,
    ITenantContext tenantContext,
    ICurrentUser currentUser,
    IAiProvider ai,
    StorefrontLayoutProcessor processor,
    ILogger<StorefrontBuilderAiController> logger) : ControllerBase
{
    private const int MaxPromptLength    = 1_000;
    private const int MaxCatalogueLength = 60_000;
    private const int MaxSectionsPage    = 10;
    private const int MaxSectionsAdd     = 4;
    private const string RequestType     = "StorefrontPage";

    private Guid TenantId => tenantContext.CurrentTenantId;

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] AiGenerateRequest req, CancellationToken ct)
    {
        var prompt = (req.Prompt ?? string.Empty).Trim();
        var mode = req.Mode?.Trim().ToLowerInvariant();
        if (prompt.Length == 0) return BadRequest(new { errors = new[] { "prompt: describe what you want." } });
        if (prompt.Length > MaxPromptLength) return BadRequest(new { errors = new[] { $"prompt: keep it under {MaxPromptLength} characters." } });
        if (mode is not ("page" or "sections")) return BadRequest(new { errors = new[] { "mode: use 'page' or 'sections'." } });
        if (string.IsNullOrWhiteSpace(req.Catalogue) || req.Catalogue.Length > MaxCatalogueLength)
            return BadRequest(new { errors = new[] { "catalogue: missing or too large." } });

        var userPrompt = await BuildUserPromptAsync(prompt, mode, req, ct);
        var maxSections = mode == "page" ? MaxSectionsPage : MaxSectionsAdd;

        AiJsonResult result;
        try
        {
            result = await ai.GenerateJsonAsync(SystemPrompt(req.Catalogue, maxSections), userPrompt, 3_500, ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogWarning(ex, "AI page generation failed for tenant {TenantId}", TenantId);
            await LogUsageAsync(0, success: false, ct);
            return StatusCode(StatusCodes.Status502BadGateway, new { errors = new[] { "The AI service didn't answer. Try again in a moment." } });
        }

        var tokens = result.PromptTokens + result.CompletionTokens;
        var (title, layout) = ToLayout(result.Json, maxSections);
        var cleaned = layout is null ? null : Validate(layout);
        if (cleaned is null)
        {
            await LogUsageAsync(tokens, success: false, ct);
            return UnprocessableEntity(new { errors = new[] { "The AI came back with a design we couldn't use. Try rephrasing your request." } });
        }

        await LogUsageAsync(tokens, success: true, ct);
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var usedThisMonth = await db.AiUsageLogs.CountAsync(l => l.TenantId == TenantId && l.CreatedAt >= monthStart, ct);

        return Ok(new
        {
            title = mode == "page" ? title : null,
            sections = JsonNode.Parse(cleaned)!["sections"],
            usedThisMonth,
        });
    }

    private static readonly Regex SectionPath = new(@"^sections\[(\d+)\]", RegexOptions.Compiled);

    /// <summary>
    /// Validates like any page layout. Sections the validator rejects (e.g. a made-up category id) are
    /// dropped and the rest is checked once more; null when nothing valid is left.
    /// </summary>
    private string? Validate(JsonObject layout)
    {
        var rules = new ImageSourceRules(Request.Host.Value);
        for (var attempt = 0; attempt < 2; attempt++)
        {
            try { return processor.PreparePageLayout(layout.ToJsonString(), rules); }
            catch (StorefrontLayoutValidationException ex)
            {
                logger.LogInformation("AI page generation: invalid sections dropped: {Errors}", string.Join("; ", ex.Errors));
                var bad = ex.Errors.Select(e => SectionPath.Match(e)).Where(m => m.Success)
                    .Select(m => int.Parse(m.Groups[1].Value)).ToHashSet();
                var sections = (JsonArray)layout["sections"]!;
                if (bad.Count == 0 || bad.Count >= sections.Count) return null;
                foreach (var i in bad.OrderByDescending(i => i)) if (i < sections.Count) sections.RemoveAt(i);
            }
        }
        return null;
    }

    // ── Prompting ───────────────────────────────────────────────────────────

    private static string SystemPrompt(string catalogue, int maxSections) => $$$"""
        You design storefront pages for a small online shop by choosing sections from a fixed catalogue and writing their copy.
        Answer with ONE JSON object only:
        {"title": "<short page name>", "sections": [{"type": "<section id>", "layout": "<layout id>", "scheme": "light|soft|contrast|brand|accent", "settings": {...}, "blocks": [{"type": "<block type>", "settings": {...}}]}]}

        Rules:
        - Use only section ids, layout ids, setting keys and block types listed in the CATALOGUE. Leave out settings you don't need (defaults apply).
        - Use at most {{{maxSections}}} sections. Vary layouts and schemes so the page has rhythm; don't repeat a section type back to back.
        - Setting values by field type:
          text / textarea: plain string. richtext: {"$richtext": "<p>…</p>"} using only p, h2, h3, ul, ol, li, strong, em, a.
          link: {"$link": "/products"} — or "/category/<category name>", "/p/<page slug>", "#section-<id>", or "" when unsure.
          select: one of the listed values. number: a number. toggle: true or false. date: "YYYY-MM-DD".
          products: {"$products": {"source": "featured|newest|sale|all|category", "categoryId": "<id from STORE CATEGORIES, only with source category>", "limit": 4-12}}.
          categories: {"$categories": {"source": "all|featured|manual", "categoryIds": ["<ids from STORE CATEGORIES>"], "limit": 3-12}}.
          list: an array of objects using the listed item fields. image and icon: leave out — the merchant adds photos.
        - Never invent prices, discounts, coupon codes, reviews or testimonials from named people, ratings, awards, certifications, stock levels, or delivery / return / warranty promises. Where such facts belong, write a short placeholder in [square brackets] for the merchant to replace.
        - Write warm, concise copy that fits this store and the request, in the store's language.

        CATALOGUE:
        {{{catalogue}}}
        """;

    private async Task<string> BuildUserPromptAsync(string prompt, string mode, AiGenerateRequest req, CancellationToken ct)
    {
        var business = await db.Businesses.AsNoTracking()
            .Where(b => b.TenantId == TenantId)
            .Select(b => new { b.Name, b.Category, b.Description, b.Language, b.Currency })
            .FirstOrDefaultAsync(ct);

        var categories = await db.Categories.AsNoTracking()
            .Where(c => c.TenantId == TenantId && c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.ParentCategoryId })
            .Take(40)
            .ToListAsync(ct);

        var products = await db.Products.AsNoTracking()
            .Where(p => p.TenantId == TenantId && p.Status == ProductStatus.Active)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new { p.Title, CategoryName = p.Category != null ? p.Category.Name : null })
            .Take(25)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine($"STORE: {business?.Name ?? "Our store"}");
        if (!string.IsNullOrWhiteSpace(business?.Category)) sb.AppendLine($"Business type: {business.Category}");
        if (!string.IsNullOrWhiteSpace(business?.Description)) sb.AppendLine($"About: {Clip(business.Description, 500)}");
        sb.AppendLine($"Language: {business?.Language ?? "en"} · Currency: {business?.Currency ?? "INR"}");

        sb.AppendLine("STORE CATEGORIES (id — name):");
        if (categories.Count == 0) sb.AppendLine("(none)");
        var names = categories.ToDictionary(c => c.Id, c => c.Name);
        foreach (var c in categories)
            sb.AppendLine($"{c.Id} — {c.Name}{(c.ParentCategoryId is { } parent && names.TryGetValue(parent, out var pn) ? $" (in {pn})" : "")}");

        sb.AppendLine("SOME PRODUCTS (for context only — products are always shown through $products):");
        foreach (var p in products) sb.AppendLine($"- {Clip(p.Title, 80)}{(p.CategoryName is null ? "" : $" ({p.CategoryName})")}");

        if (mode == "page")
            sb.AppendLine("TASK: Design a complete new page for this store.");
        else
        {
            sb.AppendLine($"TASK: Add a few sections to the existing page \"{Clip(req.PageTitle ?? "page", 80)}\".");
            if (req.ExistingSections is { Count: > 0 } existing)
                sb.AppendLine($"It already has: {string.Join(", ", existing.Take(30).Select(s => Clip(s, 40)))}. Complement them; don't duplicate.");
        }
        sb.AppendLine($"MERCHANT'S REQUEST: {prompt}");
        return sb.ToString();
    }

    // ── Result handling ─────────────────────────────────────────────────────

    private static readonly Regex TypePattern = new("^[a-z0-9][a-z0-9-]{0,39}$", RegexOptions.Compiled);

    /// <summary>
    /// Model JSON → <c>{ schemaVersion, sections }</c> with fresh ids and without images (the AI never
    /// has uploads to point at). Malformed sections are skipped; null when nothing usable is left.
    /// </summary>
    private static (string? Title, JsonObject? Layout) ToLayout(string json, int maxSections)
    {
        JsonNode? root;
        try { root = JsonNode.Parse(json); }
        catch (JsonException) { return (null, null); }
        if (root is not JsonObject obj || obj["sections"] is not JsonArray raw) return (null, null);

        var sections = new JsonArray();
        foreach (var node in raw)
        {
            if (sections.Count >= maxSections) break;
            if (node is not JsonObject s || s["type"]?.GetValueKind() != JsonValueKind.String) continue;
            var type = s["type"]!.GetValue<string>().Trim().ToLowerInvariant();
            if (!TypePattern.IsMatch(type)) continue;

            var section = new JsonObject { ["id"] = NewId(type), ["type"] = type };
            if (s["layout"] is JsonValue lv && lv.TryGetValue<string>(out var layout) && TypePattern.IsMatch(layout)) section["layout"] = layout;
            if (s["scheme"] is JsonValue sv && sv.TryGetValue<string>(out var scheme) && scheme is "light" or "soft" or "contrast" or "brand" or "accent") section["scheme"] = scheme;
            if (s["settings"] is JsonObject settings) section["settings"] = StripImages(settings.DeepClone());

            if (s["blocks"] is JsonArray blocks)
            {
                var cleanBlocks = new JsonArray();
                foreach (var b in blocks.Take(20))
                {
                    if (b is not JsonObject bo || bo["type"] is not JsonValue btv || !btv.TryGetValue<string>(out var bt) || !TypePattern.IsMatch(bt)) continue;
                    var block = new JsonObject { ["id"] = NewId(bt), ["type"] = bt };
                    if (bo["settings"] is JsonObject bs) block["settings"] = StripImages(bs.DeepClone());
                    cleanBlocks.Add(block);
                }
                if (cleanBlocks.Count > 0) section["blocks"] = cleanBlocks;
            }
            sections.Add(section);
        }

        if (sections.Count == 0) return (null, null);
        var title = obj["title"] is JsonValue tv && tv.TryGetValue<string>(out var t) ? Clip(t.Trim(), 80) : null;
        return (string.IsNullOrWhiteSpace(title) ? null : title, new JsonObject { ["schemaVersion"] = 1, ["sections"] = sections });
    }

    /// <summary>Removes every <c>{"$image": …}</c> value (and nested ones in lists).</summary>
    private static JsonNode? StripImages(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                foreach (var key in o.Select(p => p.Key).ToList())
                {
                    if (o[key] is JsonObject child && child.ContainsKey("$image")) o.Remove(key);
                    else StripImages(o[key]);
                }
                break;
            case JsonArray a:
                for (var i = a.Count - 1; i >= 0; i--)
                {
                    if (a[i] is JsonObject child && child.ContainsKey("$image")) a.RemoveAt(i);
                    else StripImages(a[i]);
                }
                break;
        }
        return node;
    }

    private static string NewId(string type)
    {
        var prefix = type.Length > 28 ? type[..28] : type;
        return $"{prefix}-{Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(3)).ToLowerInvariant()}";
    }

    private static string Clip(string value, int max) => value.Length > max ? value[..max] : value;

    private async Task LogUsageAsync(int tokens, bool success, CancellationToken ct)
    {
        db.AiUsageLogs.Add(new AiUsageLog
        {
            TenantId      = TenantId,
            UserId        = currentUser.UserId ?? Guid.Empty,
            RequestType   = RequestType,
            TokensUsed    = tokens,
            Provider      = ai.ProviderName,
            WasSuccessful = success,
        });
        await db.SaveChangesAsync(ct);
    }
}

/// <summary>
/// <c>mode</c>: <c>page</c> (a whole new page) or <c>sections</c> (sections for the open page).
/// <c>catalogue</c>: the editor's compact list of section packs, layouts and fields.
/// </summary>
public record AiGenerateRequest(string? Prompt, string? Mode, string? Catalogue, string? PageTitle, List<string>? ExistingSections);
