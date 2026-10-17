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
/// </summary>
[ApiController]
[Route("api/v1/public/{slug}/site")]
public class PublicStorefrontSiteController(
    AppDbContext db,
    ITenantContext tenantContext,
    StorefrontSmartValueResolver resolver) : ControllerBase
{
    private const string CacheHeader = "public, max-age=60, stale-while-revalidate=300";

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
    public async Task<IActionResult> GetSite(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();
        var tenantId = tenantContext.CurrentTenantId;

        var theme = await db.StorefrontThemes.AsNoTracking()
            .FirstOrDefaultAsync(t => t.TenantId == tenantId, ct);

        JsonNode? doc = null;
        if (theme?.PublishedJson is not null)
        {
            doc = JsonNode.Parse(theme.PublishedJson);
            if (doc is not null) await resolver.ResolveAsync(doc, AbsoluteUrl, ct);
        }

        var pages = await db.StorefrontPages.AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.IsPublished
                     && (p.PageType == StorefrontPageType.Custom || p.PageType == StorefrontPageType.Home)
                     && p.PublishedLayoutJson != null)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Title)
            .Select(p => new { p.Id, p.Title, p.Slug, p.PageType, p.ShowInNav, p.ShowInFooter, HasLayout = p.PublishedLayoutJson != null })
            .ToListAsync(ct);

        Response.Headers.CacheControl = CacheHeader;
        return Ok(new
        {
            version     = theme?.Version ?? 0,
            publishedAt = theme?.PublishedAt,
            doc,
            hasHome     = pages.Any(p => p.PageType == StorefrontPageType.Home && p.HasLayout),
            pages       = pages.Where(p => p.PageType == StorefrontPageType.Custom)
                               .Select(p => new { p.Id, p.Title, p.Slug, p.ShowInNav, p.ShowInFooter }),
        });
    }

    /// <summary>A published page by slug; <c>home</c> returns the Home page.</summary>
    [HttpGet("pages/{pageSlug}")]
    public async Task<IActionResult> GetPage(string slug, string pageSlug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();
        var tenantId = tenantContext.CurrentTenantId;
        var isHome = pageSlug.Equals("home", StringComparison.OrdinalIgnoreCase);

        var page = await db.StorefrontPages.AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.IsPublished)
            .Where(p => isHome
                ? p.PageType == StorefrontPageType.Home
                : p.PageType == StorefrontPageType.Custom && p.Slug == pageSlug)
            .FirstOrDefaultAsync(ct);
        if (page?.PublishedLayoutJson is null) return NotFound();

        return Ok(await ToResponseAsync(page, page.PublishedLayoutJson, ct));
    }

    /// <summary>Published system design: product | quickview | collection | cart | search | not-found.</summary>
    [HttpGet("templates/{kind}")]
    public async Task<IActionResult> GetTemplate(string slug, string kind, CancellationToken ct)
    {
        if (!tenantContext.IsResolved || !TemplateKinds.TryGetValue(kind, out var type)) return NotFound();
        var tenantId = tenantContext.CurrentTenantId;

        var page = await db.StorefrontPages.AsNoTracking()
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.PageType == type && p.PublishedLayoutJson != null, ct);
        if (page is null) return NotFound();

        return Ok(await ToResponseAsync(page, page.PublishedLayoutJson!, ct));
    }

    private async Task<object> ToResponseAsync(StorefrontPage page, string layoutJson, CancellationToken ct)
    {
        var layout = JsonNode.Parse(layoutJson);
        if (layout is not null) await resolver.ResolveAsync(layout, AbsoluteUrl, ct);

        Response.Headers.CacheControl = CacheHeader;
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
