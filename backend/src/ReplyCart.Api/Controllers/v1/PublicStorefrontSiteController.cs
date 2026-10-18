using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.StorefrontBuilder;
using ReplyCart.Domain.Storefront;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Storefront builder — public, anonymous reads of the PUBLISHED site (SB-R2).
/// Tenant is resolved from the slug by TenantResolutionMiddleware (SF-R1).
/// Smart values (<c>$products</c>, <c>$categories</c>) are filled with live catalog data.
/// When a store has never published, <c>doc</c> is null / pages 404 and the
/// storefront falls back to its built-in Starter design (SB-R5).
/// <c>?preview={token}</c> (the merchant's shareable preview link, SB-R22) returns the saved drafts
/// instead, uncached; a wrong or revoked token gets 410.
/// </summary>
[ApiController]
[Route("api/v1/public/{slug}/site")]
public class PublicStorefrontSiteController(
    AppDbContext db,
    ITenantContext tenantContext,
    StorefrontSmartValueResolver resolver) : ControllerBase
{
    private const string CacheHeader = "public, max-age=60, stale-while-revalidate=300";
    // The site document carries the publish `version` that every page / template URL is keyed on (`?v=`),
    // so it must be revalidated on every load — otherwise a fresh publish stays hidden for up to ~6 minutes.
    private const string SiteCacheHeader = "public, no-cache";
    private const string NoStoreHeader = "private, no-store";

    private static readonly Dictionary<string, StorefrontPageType> TemplateKinds = new(StringComparer.OrdinalIgnoreCase)
    {
        ["product"]    = StorefrontPageType.ProductTemplate,
        ["quickview"]  = StorefrontPageType.QuickViewTemplate,
        ["collection"] = StorefrontPageType.CollectionTemplate,
        ["cart"]       = StorefrontPageType.Cart,
        ["search"]     = StorefrontPageType.Search,
        ["not-found"]  = StorefrontPageType.NotFound,
    };

    /// <summary>Published site document (theme, header, footer, menus) + navigable pages.</summary>
    [HttpGet]
    public async Task<IActionResult> GetSite(string slug, [FromQuery] string? preview, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();
        var tenantId = tenantContext.CurrentTenantId;

        var theme = await db.StorefrontThemes.AsNoTracking()
            .FirstOrDefaultAsync(t => t.TenantId == tenantId, ct);

        var isPreview = preview is not null;
        if (isPreview && !TokenMatches(theme?.PreviewToken, preview)) return PreviewGone();

        JsonNode? doc = null;
        var siteJson = isPreview ? theme?.DraftJson ?? theme?.PublishedJson : theme?.PublishedJson;
        if (siteJson is not null)
        {
            doc = JsonNode.Parse(siteJson);
            if (doc is not null) await resolver.ResolveAsync(doc, AbsoluteUrl, ct);
        }

        var pages = await db.StorefrontPages.AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.IsPublished
                     && (p.PageType == StorefrontPageType.Custom || p.PageType == StorefrontPageType.Home)
                     && (p.PublishedLayoutJson != null || (isPreview && p.DraftLayoutJson != null)))
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Title)
            .Select(p => new { p.Id, p.Title, p.Slug, p.PageType, p.ShowInNav, p.ShowInFooter })
            .ToListAsync(ct);

        // Extra product designs (SB-R21) that have been published (or drafted, in a preview), with their categories / products.
        var altTemplates = await db.StorefrontPages.AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.PageType == StorefrontPageType.AltProductTemplate && p.AssignmentJson != null
                     && (p.PublishedLayoutJson != null || (isPreview && p.DraftLayoutJson != null)))
            .Select(p => new { p.Id, p.AssignmentJson })
            .ToListAsync(ct);

        Response.Headers.CacheControl = isPreview ? NoStoreHeader : SiteCacheHeader;
        return Ok(new
        {
            version     = theme?.Version ?? 0,
            publishedAt = theme?.PublishedAt,
            preview     = isPreview,
            doc,
            hasHome     = pages.Any(p => p.PageType == StorefrontPageType.Home),
            pages       = pages.Where(p => p.PageType == StorefrontPageType.Custom)
                               .Select(p => new { p.Id, p.Title, p.Slug, p.ShowInNav, p.ShowInFooter }),
            productTemplates = await ProductTemplateRulesAsync(tenantId, altTemplates.Select(t => (t.Id, t.AssignmentJson)), ct),
        });
    }

    /// <summary>A published page by slug; <c>home</c> returns the Home page.</summary>
    [HttpGet("pages/{pageSlug}")]
    public async Task<IActionResult> GetPage(string slug, string pageSlug, [FromQuery] string? preview, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();
        var tenantId = tenantContext.CurrentTenantId;
        var isHome = pageSlug.Equals("home", StringComparison.OrdinalIgnoreCase);
        var isPreview = preview is not null;
        if (isPreview && !await PreviewValidAsync(tenantId, preview, ct)) return PreviewGone();

        var page = await db.StorefrontPages.AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.IsPublished)
            .Where(p => isHome
                ? p.PageType == StorefrontPageType.Home
                : p.PageType == StorefrontPageType.Custom && p.Slug == pageSlug)
            .FirstOrDefaultAsync(ct);
        var layout = page is null ? null : LayoutOf(page, isPreview);
        if (layout is null) return NotFound();

        return Ok(await ToResponseAsync(page!, layout, isPreview, ct));
    }

    /// <summary>
    /// Published system design: product | quickview | collection | cart | search | not-found.
    /// <c>product?id=</c> asks for an extra product design (SB-R21); unknown / unpublished ids fall back to the default.
    /// </summary>
    [HttpGet("templates/{kind}")]
    public async Task<IActionResult> GetTemplate(string slug, string kind, [FromQuery] Guid? id, [FromQuery] string? preview, CancellationToken ct)
    {
        if (!tenantContext.IsResolved || !TemplateKinds.TryGetValue(kind, out var type)) return NotFound();
        var tenantId = tenantContext.CurrentTenantId;
        var isPreview = preview is not null;
        if (isPreview && !await PreviewValidAsync(tenantId, preview, ct)) return PreviewGone();

        StorefrontPage? page = null;
        if (id is { } altId && type == StorefrontPageType.ProductTemplate)
            page = await db.StorefrontPages.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == altId && p.TenantId == tenantId && p.PageType == StorefrontPageType.AltProductTemplate
                    && (p.PublishedLayoutJson != null || (isPreview && p.DraftLayoutJson != null)), ct);
        page ??= await db.StorefrontPages.AsNoTracking()
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.PageType == type
                && (p.PublishedLayoutJson != null || (isPreview && p.DraftLayoutJson != null)), ct);
        if (page is null) return NotFound();

        return Ok(await ToResponseAsync(page, LayoutOf(page, isPreview)!, isPreview, ct));
    }

    // ── Preview link helpers (SB-R22) ───────────────────────────────────────

    private static string? LayoutOf(StorefrontPage page, bool preview) =>
        preview ? page.DraftLayoutJson ?? page.PublishedLayoutJson : page.PublishedLayoutJson;

    private async Task<bool> PreviewValidAsync(Guid tenantId, string? token, CancellationToken ct)
    {
        var stored = await db.StorefrontThemes.AsNoTracking()
            .Where(t => t.TenantId == tenantId).Select(t => t.PreviewToken).FirstOrDefaultAsync(ct);
        return TokenMatches(stored, token);
    }

    /// <summary>Constant-time comparison so the token can't be guessed byte by byte.</summary>
    private static bool TokenMatches(string? stored, string? given) =>
        stored is not null && given is not null &&
        System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(
            System.Text.Encoding.UTF8.GetBytes(stored), System.Text.Encoding.UTF8.GetBytes(given));

    private IActionResult PreviewGone()
    {
        Response.Headers.CacheControl = NoStoreHeader;
        return StatusCode(StatusCodes.Status410Gone, new { error = "This preview link has been turned off." });
    }

    /// <summary>
    /// Extra product designs with their assignments. A design assigned to a category also covers that
    /// category's sub-categories, unless a sub-category has a design of its own.
    /// </summary>
    private async Task<List<object>> ProductTemplateRulesAsync(Guid tenantId, IEnumerable<(Guid Id, string? Json)> templates, CancellationToken ct)
    {
        var rules = templates
            .Select(t => (t.Id, A: ProductTemplateAssignment.Parse(t.Json)))
            .Where(t => t.A.CategoryIds!.Count > 0 || t.A.ProductIds!.Count > 0)
            .ToList();
        if (rules.Count == 0) return new();

        var direct = new Dictionary<Guid, Guid>();
        foreach (var (id, a) in rules)
            foreach (var c in a.CategoryIds!) direct.TryAdd(c, id);

        if (direct.Count > 0)
        {
            var subs = await db.Categories.AsNoTracking()
                .Where(c => c.TenantId == tenantId && c.ParentCategoryId != null)
                .Select(c => new { c.Id, Parent = c.ParentCategoryId!.Value })
                .ToListAsync(ct);
            foreach (var sub in subs)
            {
                if (direct.ContainsKey(sub.Id) || !direct.TryGetValue(sub.Parent, out var templateId)) continue;
                rules.First(r => r.Id == templateId).A.CategoryIds!.Add(sub.Id);
            }
        }

        return rules.Select(r => (object)new { r.Id, r.A.CategoryIds, r.A.ProductIds }).ToList();
    }

    private async Task<object> ToResponseAsync(StorefrontPage page, string layoutJson, bool preview, CancellationToken ct)
    {
        var layout = JsonNode.Parse(layoutJson);
        if (layout is not null) await resolver.ResolveAsync(layout, AbsoluteUrl, ct);

        Response.Headers.CacheControl = preview ? NoStoreHeader : CacheHeader;
        return new
        {
            page.Id,
            page.Title,
            page.Slug,
            PageType = page.PageType.ToString(),
            page.SeoTitle,
            page.SeoDescription,
            OgImageUrl = AbsoluteUrl(page.OgImageUrl),
            UpdatedAt = page.PublishedAt ?? page.UpdatedAt ?? page.CreatedAt,
            Layout = layout,
        };
    }

    /// <summary>Same rule as PublicStorefrontController: root-relative /uploads/… → this API host.</summary>
    private string? AbsoluteUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        if (url.StartsWith("http://") || url.StartsWith("https://")) return url;
        return $"{Request.Scheme}://{Request.Host}{url}";
    }
}
