using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.StorefrontBuilder;
using ReplyCart.Domain.Storefront;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Storefront builder — merchant side (authenticated, tenant-scoped).
/// Theme (site document) and pages are edited as drafts; <c>POST publish</c>
/// copies drafts to what shoppers see. See docs/plan-storefront-builder.md §6.
/// </summary>
[ApiController]
[Route("api/v1/storefront-builder")]
[Authorize]
public class StorefrontBuilderController(
    AppDbContext db,
    ITenantContext tenantContext,
    StorefrontLayoutProcessor processor) : ControllerBase
{
    /// <summary>Slugs a custom page may not use (they clash with storefront routes).</summary>
    private static readonly HashSet<string> ReservedSlugs =
        ["home", "products", "product", "category", "categories", "p", "order-confirmation", "cart", "search", "account", "checkout"];

    private Guid TenantId => tenantContext.CurrentTenantId;
    private ImageSourceRules ImageRules => new(Request.Host.Value);

    // ── Theme (site document) ─────────────────────────────────────────────────

    [HttpGet("theme")]
    public async Task<IActionResult> GetTheme(CancellationToken ct)
    {
        var theme = await db.StorefrontThemes.FirstOrDefaultAsync(t => t.TenantId == TenantId, ct);
        return Ok(new
        {
            draft       = theme is null ? null : JsonNode.Parse(theme.DraftJson),
            published   = theme?.PublishedJson is null ? null : JsonNode.Parse(theme.PublishedJson),
            publishedAt = theme?.PublishedAt,
            version     = theme?.Version ?? 0,
            updatedAt   = theme?.UpdatedAt ?? theme?.CreatedAt,
        });
    }

    /// <summary>Autosaves the theme draft. Body: the whole site document.</summary>
    [HttpPut("theme")]
    public async Task<IActionResult> SaveTheme([FromBody] JsonElement document, CancellationToken ct)
    {
        string cleaned;
        try { cleaned = processor.PrepareSiteDocument(document.GetRawText(), ImageRules); }
        catch (StorefrontLayoutValidationException ex) { return BadRequest(new { errors = ex.Errors }); }

        var theme = await db.StorefrontThemes.FirstOrDefaultAsync(t => t.TenantId == TenantId, ct);
        if (theme is null)
        {
            theme = new StorefrontTheme { TenantId = TenantId, DraftJson = cleaned };
            db.StorefrontThemes.Add(theme);
        }
        else
        {
            theme.DraftJson = cleaned;
        }
        await db.SaveChangesAsync(ct);
        return Ok(new { updatedAt = theme.UpdatedAt ?? theme.CreatedAt });
    }

    // ── Pages ─────────────────────────────────────────────────────────────────

    [HttpGet("pages")]
    public async Task<IActionResult> ListPages(CancellationToken ct)
    {
        var pages = await db.StorefrontPages
            .Where(p => p.TenantId == TenantId)
            .OrderBy(p => p.PageType).ThenBy(p => p.SortOrder).ThenBy(p => p.Title)
            .Select(p => new
            {
                p.Id, p.Title, p.Slug, p.PageType, p.IsPublished, p.ShowInNav, p.ShowInFooter, p.SortOrder,
                p.PublishedAt, p.CreatedAt, p.UpdatedAt,
                HasDraft = p.DraftLayoutJson != null,
                HasUnpublishedChanges = p.DraftLayoutJson != null && p.DraftLayoutJson != p.PublishedLayoutJson,
            })
            .ToListAsync(ct);

        return Ok(pages.Select(p => new
        {
            p.Id, p.Title, p.Slug, PageType = p.PageType.ToString(), p.IsPublished, p.ShowInNav, p.ShowInFooter,
            p.SortOrder, p.PublishedAt, UpdatedAt = p.UpdatedAt ?? p.CreatedAt, p.HasDraft, p.HasUnpublishedChanges,
        }));
    }

    [HttpGet("pages/{id:guid}")]
    public async Task<IActionResult> GetPage(Guid id, CancellationToken ct)
    {
        var p = await db.StorefrontPages.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == TenantId, ct);
        if (p is null) return NotFound();
        return Ok(ToDetail(p));
    }

    [HttpPost("pages")]
    public async Task<IActionResult> CreatePage([FromBody] UpsertBuilderPageRequest req, CancellationToken ct)
    {
        var type = ParsePageType(req.PageType);
        if (type is null) return BadRequest(new { errors = new[] { "pageType: unknown page type." } });
        if (string.IsNullOrWhiteSpace(req.Title) && type == StorefrontPageType.Custom)
            return BadRequest(new { errors = new[] { "title: required." } });

        if (type != StorefrontPageType.Custom &&
            await db.StorefrontPages.AnyAsync(p => p.TenantId == TenantId && p.PageType == type, ct))
            return Conflict(new { errors = new[] { $"A {type} page already exists." } });

        var page = new StorefrontPage
        {
            TenantId  = TenantId,
            PageType  = type.Value,
            Title     = (string.IsNullOrWhiteSpace(req.Title) ? type.Value.ToString() : req.Title).Trim(),
            IsPublished = req.IsPublished ?? true,
            ShowInNav   = req.ShowInNav ?? false,
            ShowInFooter = req.ShowInFooter ?? false,
            SortOrder   = req.SortOrder ?? 0,
        };

        var error = await ApplyAsync(page, req, isNew: true, ct);
        if (error is not null) return error;

        db.StorefrontPages.Add(page);
        await db.SaveChangesAsync(ct);
        return Ok(ToDetail(page));
    }

    [HttpPut("pages/{id:guid}")]
    public async Task<IActionResult> UpdatePage(Guid id, [FromBody] UpsertBuilderPageRequest req, CancellationToken ct)
    {
        var page = await db.StorefrontPages.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == TenantId, ct);
        if (page is null) return NotFound();

        if (req.Title is not null)
        {
            if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { errors = new[] { "title: required." } });
            page.Title = req.Title.Trim();
        }
        if (req.IsPublished.HasValue)  page.IsPublished  = req.IsPublished.Value;
        if (req.ShowInNav.HasValue)    page.ShowInNav    = req.ShowInNav.Value;
        if (req.ShowInFooter.HasValue) page.ShowInFooter = req.ShowInFooter.Value;
        if (req.SortOrder.HasValue)    page.SortOrder    = req.SortOrder.Value;

        var error = await ApplyAsync(page, req, isNew: false, ct);
        if (error is not null) return error;

        await db.SaveChangesAsync(ct);
        return Ok(ToDetail(page));
    }

    [HttpDelete("pages/{id:guid}")]
    public async Task<IActionResult> DeletePage(Guid id, CancellationToken ct)
    {
        var page = await db.StorefrontPages.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == TenantId, ct);
        if (page is null) return NotFound();
        if (page.PageType != StorefrontPageType.Custom)
            return Conflict(new { errors = new[] { "Home and system pages can't be deleted; reset their layout instead." } });

        page.IsDeleted = true;
        page.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("pages/{id:guid}/duplicate")]
    public async Task<IActionResult> DuplicatePage(Guid id, CancellationToken ct)
    {
        var src = await db.StorefrontPages.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == TenantId, ct);
        if (src is null) return NotFound();

        var title = $"{src.Title} (copy)";
        var copy = new StorefrontPage
        {
            TenantId        = TenantId,
            PageType        = StorefrontPageType.Custom,
            Title           = title.Length > 200 ? title[..200] : title,
            Slug            = await UniqueSlugAsync(Slugify(title), null, ct),
            DraftLayoutJson = src.DraftLayoutJson ?? src.PublishedLayoutJson,
            IsPublished     = false,
            SortOrder       = src.SortOrder,
            SeoTitle        = src.SeoTitle,
            SeoDescription  = src.SeoDescription,
            OgImageUrl      = src.OgImageUrl,
        };
        db.StorefrontPages.Add(copy);
        await db.SaveChangesAsync(ct);
        return Ok(ToDetail(copy));
    }

    // ── Publish ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Publishes the theme draft and page drafts together in one save (all-or-nothing, SB-R2).
    /// <c>pageIds</c> omitted = every page that has a draft. <c>brandColors</c> (the published
    /// palette's colours, resolved by the editor) are copied to the store's brand colours so
    /// surfaces outside the builder — PWA manifest, chatbot widget, emails — match the design.
    /// </summary>
    [HttpPost("publish")]
    public async Task<IActionResult> Publish([FromBody] PublishRequest? req, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var includeTheme = req?.IncludeTheme ?? true;

        var theme = await db.StorefrontThemes.FirstOrDefaultAsync(t => t.TenantId == TenantId, ct);
        if (includeTheme && theme is not null)
        {
            theme.PublishedJson = theme.DraftJson;
            theme.PublishedAt   = now;
            theme.Version++;
        }

        var pagesQuery = db.StorefrontPages.Where(p => p.TenantId == TenantId && p.DraftLayoutJson != null);
        if (req?.PageIds is { Count: > 0 } ids)
            pagesQuery = pagesQuery.Where(p => ids.Contains(p.Id));
        var pages = await pagesQuery.ToListAsync(ct);
        foreach (var p in pages)
        {
            p.PublishedLayoutJson = p.DraftLayoutJson;
            p.PublishedAt = now;
        }

        // Pages-only publishes still bump the version so storefront caches refresh.
        if (!includeTheme && theme is not null && pages.Count > 0) theme.Version++;

        if (includeTheme && req?.BrandColors is { } colors)
        {
            if (!IsHex(colors.Primary) || !IsHex(colors.Secondary) || (colors.Accent is not null && !IsHex(colors.Accent)))
                return BadRequest(new { errors = new[] { "brandColors: use #RRGGBB colours." } });
            var settings = await db.StorefrontSettings.FirstOrDefaultAsync(s => s.TenantId == TenantId, ct);
            if (settings is not null)
            {
                settings.ThemeColor     = colors.Primary;
                settings.SecondaryColor = colors.Secondary;
                settings.AccentColor    = colors.Accent;
            }
        }

        await db.SaveChangesAsync(ct);
        return Ok(new { version = theme?.Version ?? 0, publishedAt = now, pages = pages.Count, theme = includeTheme && theme is not null });
    }

    // ── Templates ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Applies a template pack's documents to the <b>drafts</b> in one save (nothing goes live until Publish).
    /// Template packs live in frontend code (plan D2), so the editor builds the documents and this endpoint
    /// only validates and stores them, staying schema-agnostic (SB-R4).
    /// <c>mode = keep</c>: only the site document (look, header, footer, behaviour) is replaced.
    /// <c>mode = replace</c>: also replaces the drafts of the given system pages and of custom pages with the
    /// same slug, and creates the template's other pages.
    /// </summary>
    [HttpPost("apply-template")]
    public async Task<IActionResult> ApplyTemplate([FromBody] ApplyTemplateRequest req, CancellationToken ct)
    {
        var mode = req.Mode?.Trim().ToLowerInvariant();
        if (mode is not ("keep" or "replace")) return BadRequest(new { errors = new[] { "mode: use 'keep' or 'replace'." } });
        if (req.Site.ValueKind != JsonValueKind.Object) return BadRequest(new { errors = new[] { "site: required." } });

        string siteJson;
        try { siteJson = processor.PrepareSiteDocument(req.Site.GetRawText(), ImageRules); }
        catch (StorefrontLayoutValidationException ex) { return BadRequest(new { errors = ex.Errors.Select(e => $"site.{e}") }); }

        // Validate every page before touching anything (all-or-nothing).
        List<ApplyTemplatePage> incoming = mode == "replace" && req.Pages is not null ? req.Pages : new();
        if (incoming.Count > 20) return BadRequest(new { errors = new[] { "pages: at most 20 pages per template." } });
        var prepared = new List<(StorefrontPageType Type, string Title, string Slug, string Layout, bool ShowInNav, bool ShowInFooter)>();
        for (var i = 0; i < incoming.Count; i++)
        {
            var p = incoming[i];
            var type = ParsePageType(p.PageType);
            if (type is null) return BadRequest(new { errors = new[] { $"pages[{i}].pageType: unknown page type." } });
            if (p.Layout.ValueKind != JsonValueKind.Object) return BadRequest(new { errors = new[] { $"pages[{i}].layout: required." } });

            string layout;
            try { layout = processor.PreparePageLayout(p.Layout.GetRawText(), ImageRules); }
            catch (StorefrontLayoutValidationException ex) { return BadRequest(new { errors = ex.Errors.Select(e => $"pages[{i}].{e}") }); }

            var title = (p.Title ?? string.Empty).Trim();
            var slug = string.Empty;
            if (type == StorefrontPageType.Custom)
            {
                if (title.Length == 0) return BadRequest(new { errors = new[] { $"pages[{i}].title: required." } });
                slug = Slugify(string.IsNullOrWhiteSpace(p.Slug) ? title : p.Slug);
                if (slug.Length == 0 || ReservedSlugs.Contains(slug))
                    return BadRequest(new { errors = new[] { $"pages[{i}].slug: '{slug}' can't be used." } });
            }
            else if (prepared.Any(x => x.Type == type))
            {
                return BadRequest(new { errors = new[] { $"pages[{i}].pageType: {type} is listed twice." } });
            }
            prepared.Add((type.Value, title.Length > 200 ? title[..200] : title, slug, layout, p.ShowInNav ?? false, p.ShowInFooter ?? false));
        }

        var theme = await db.StorefrontThemes.FirstOrDefaultAsync(t => t.TenantId == TenantId, ct);
        if (theme is null)
        {
            theme = new StorefrontTheme { TenantId = TenantId, DraftJson = siteJson };
            db.StorefrontThemes.Add(theme);
        }
        else
        {
            theme.DraftJson = siteJson;
        }

        List<StorefrontPage> existing = prepared.Count == 0
            ? new()
            : await db.StorefrontPages.Where(p => p.TenantId == TenantId).ToListAsync(ct);
        var takenSlugs = existing.Select(p => p.Slug).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var touched = new List<StorefrontPage>();
        foreach (var p in prepared)
        {
            var page = p.Type == StorefrontPageType.Custom
                ? existing.FirstOrDefault(x => x.PageType == StorefrontPageType.Custom && string.Equals(x.Slug, p.Slug, StringComparison.OrdinalIgnoreCase))
                : existing.FirstOrDefault(x => x.PageType == p.Type);

            if (page is null)
            {
                var baseSlug = p.Type == StorefrontPageType.Custom ? p.Slug : "__" + Slugify(p.Type.ToString());
                var slug = baseSlug;
                for (var n = 2; takenSlugs.Contains(slug); n++) slug = $"{baseSlug}-{n}";
                takenSlugs.Add(slug);
                page = new StorefrontPage
                {
                    TenantId     = TenantId,
                    PageType     = p.Type,
                    Title        = p.Type == StorefrontPageType.Custom ? p.Title : p.Type.ToString(),
                    Slug         = slug,
                    IsPublished  = true,
                    ShowInNav    = p.ShowInNav,
                    ShowInFooter = p.ShowInFooter,
                };
                db.StorefrontPages.Add(page);
            }
            page.DraftLayoutJson = p.Layout;
            touched.Add(page);
        }

        await db.SaveChangesAsync(ct);
        return Ok(new
        {
            updatedAt = theme.UpdatedAt ?? theme.CreatedAt,
            pages = touched.Select(p => new { p.Id, p.Title, p.Slug, PageType = p.PageType.ToString() }),
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>Applies slug, SEO and draft layout from the request. Returns an error result or null.</summary>
    private async Task<IActionResult?> ApplyAsync(StorefrontPage page, UpsertBuilderPageRequest req, bool isNew, CancellationToken ct)
    {
        if (page.PageType == StorefrontPageType.Custom)
        {
            if (isNew || req.Slug is not null || req.Title is not null && page.Slug.Length == 0)
            {
                var slug = Slugify(string.IsNullOrWhiteSpace(req.Slug) ? page.Title : req.Slug);
                if (slug.Length == 0) return BadRequest(new { errors = new[] { "slug: use letters or numbers." } });
                if (ReservedSlugs.Contains(slug)) return BadRequest(new { errors = new[] { $"slug: '{slug}' is reserved, choose another." } });
                page.Slug = await UniqueSlugAsync(slug, isNew ? null : page.Id, ct);
            }
        }
        else if (isNew)
        {
            page.Slug = "__" + Slugify(page.PageType.ToString());
        }

        if (req.SeoTitle is not null)       page.SeoTitle       = Trim(req.SeoTitle, 200);
        if (req.SeoDescription is not null) page.SeoDescription = Trim(req.SeoDescription, 500);
        if (req.OgImageUrl is not null)
        {
            var og = req.OgImageUrl.Trim();
            if (og.Length > 0 && !StorefrontLayoutProcessor.IsAllowedImage(og, ImageRules))
                return BadRequest(new { errors = new[] { "ogImageUrl: images must be uploaded to this store." } });
            page.OgImageUrl = og.Length == 0 ? null : og;
        }

        if (req.Layout is { ValueKind: not JsonValueKind.Null and not JsonValueKind.Undefined } layout)
        {
            try { page.DraftLayoutJson = processor.PreparePageLayout(layout.GetRawText(), ImageRules); }
            catch (StorefrontLayoutValidationException ex) { return BadRequest(new { errors = ex.Errors }); }
        }
        return null;
    }

    private static object ToDetail(StorefrontPage p) => new
    {
        p.Id, p.Title, p.Slug, PageType = p.PageType.ToString(), p.IsPublished, p.ShowInNav, p.ShowInFooter, p.SortOrder,
        p.SeoTitle, p.SeoDescription, p.OgImageUrl, p.PublishedAt, UpdatedAt = p.UpdatedAt ?? p.CreatedAt,
        DraftLayout     = p.DraftLayoutJson is null ? null : JsonNode.Parse(p.DraftLayoutJson),
        PublishedLayout = p.PublishedLayoutJson is null ? null : JsonNode.Parse(p.PublishedLayoutJson),
    };

    private static StorefrontPageType? ParsePageType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return StorefrontPageType.Custom;
        return Enum.TryParse<StorefrontPageType>(value, ignoreCase: true, out var t) && Enum.IsDefined(t) ? t : null;
    }

    internal static string Slugify(string input)
    {
        // "ProductTemplate" → "product-template"; "About Us!" → "about-us"
        var s = Regex.Replace(input.Trim(), @"(?<=[a-z0-9])(?=[A-Z])", "-").ToLowerInvariant();
        s = Regex.Replace(s, @"[^a-z0-9\s-]", "");
        s = Regex.Replace(s, @"\s+", "-");
        s = Regex.Replace(s, @"-+", "-").Trim('-');
        return s.Length > 80 ? s[..80].Trim('-') : s;
    }

    private async Task<string> UniqueSlugAsync(string slug, Guid? excludeId, CancellationToken ct)
    {
        var candidate = slug;
        var n = 2;
        while (await db.StorefrontPages.AnyAsync(p => p.TenantId == TenantId && p.Slug == candidate && p.Id != excludeId, ct))
            candidate = $"{slug}-{n++}";
        return candidate;
    }

    private static bool IsHex(string? value) => value is not null && HexColor.IsMatch(value);
    private static readonly Regex HexColor = new("^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

    private static string? Trim(string value, int max)
    {
        var v = value.Trim();
        return v.Length == 0 ? null : v.Length > max ? v[..max] : v;
    }
}

/// <summary>Create / partial update. Null properties are left unchanged on update.</summary>
public record UpsertBuilderPageRequest(
    string? Title,
    string? Slug,
    string? PageType,
    JsonElement? Layout,
    bool? IsPublished,
    bool? ShowInNav,
    bool? ShowInFooter,
    int? SortOrder,
    string? SeoTitle,
    string? SeoDescription,
    string? OgImageUrl);

public record PublishRequest(List<Guid>? PageIds, bool? IncludeTheme, BrandColors? BrandColors);

/// <summary>A template's documents, built by the editor from a template pack.</summary>
public record ApplyTemplateRequest(string? Mode, JsonElement Site, List<ApplyTemplatePage>? Pages);

/// <summary>One page of a template. <c>PageType</c>: Home, CollectionTemplate, ProductTemplate … or Custom (needs a title).</summary>
public record ApplyTemplatePage(string? PageType, string? Title, string? Slug, JsonElement Layout, bool? ShowInNav, bool? ShowInFooter);

/// <summary>Resolved palette colours sent by the editor on publish.</summary>
public record BrandColors(string Primary, string Secondary, string? Accent);
