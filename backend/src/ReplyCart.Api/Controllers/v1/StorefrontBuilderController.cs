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
                p.PublishedAt, p.CreatedAt, p.UpdatedAt, p.AssignmentJson,
                HasDraft = p.DraftLayoutJson != null,
                HasUnpublishedChanges = p.DraftLayoutJson != null && p.DraftLayoutJson != p.PublishedLayoutJson,
            })
            .ToListAsync(ct);

        return Ok(pages.Select(p => new
        {
            p.Id, p.Title, p.Slug, PageType = p.PageType.ToString(), p.IsPublished, p.ShowInNav, p.ShowInFooter,
            p.SortOrder, p.PublishedAt, UpdatedAt = p.UpdatedAt ?? p.CreatedAt, p.HasDraft, p.HasUnpublishedChanges,
            Assignment = p.PageType == StorefrontPageType.AltProductTemplate ? ProductTemplateAssignment.Parse(p.AssignmentJson) : null,
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
        if (string.IsNullOrWhiteSpace(req.Title) && IsMultiPage(type.Value))
            return BadRequest(new { errors = new[] { "title: required." } });

        if (!IsMultiPage(type.Value) &&
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
        if (!IsMultiPage(page.PageType))
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
        // A product design copies as another product design (without its assignments); anything else as a custom page.
        var altCopy = src.PageType == StorefrontPageType.AltProductTemplate;
        var copy = new StorefrontPage
        {
            TenantId        = TenantId,
            PageType        = altCopy ? StorefrontPageType.AltProductTemplate : StorefrontPageType.Custom,
            Title           = title.Length > 200 ? title[..200] : title,
            Slug            = await UniqueSlugAsync((altCopy ? AltSlugPrefix : string.Empty) + Slugify(title), null, ct),
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

        if (theme?.PublishedJson is not null && (includeTheme || pages.Count > 0))
            await SnapshotVersionAsync(theme, now, ct);

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
            if (type is null || type == StorefrontPageType.AltProductTemplate)
                return BadRequest(new { errors = new[] { $"pages[{i}].pageType: unknown page type." } });
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

    // ── Alternate product templates ───────────────────────────────────────────

    /// <summary>
    /// Sets which categories and products use an extra product design (SB-R21). Ids already assigned to
    /// another design move to this one, so every product / category has at most one. Applies at once
    /// (assignments are not drafts); shoppers see the design once it has been published.
    /// </summary>
    [HttpPut("pages/{id:guid}/assignment")]
    public async Task<IActionResult> SetAssignment(Guid id, [FromBody] ProductTemplateAssignment req, CancellationToken ct)
    {
        var page = await db.StorefrontPages.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == TenantId, ct);
        if (page is null) return NotFound();
        if (page.PageType != StorefrontPageType.AltProductTemplate)
            return BadRequest(new { errors = new[] { "Only extra product designs can be assigned." } });

        var categoryIds = (req.CategoryIds ?? new()).Distinct().ToList();
        var productIds  = (req.ProductIds ?? new()).Distinct().ToList();
        if (categoryIds.Count > MaxAssignedCategories || productIds.Count > MaxAssignedProducts)
            return BadRequest(new { errors = new[] { $"Assign at most {MaxAssignedCategories} categories and {MaxAssignedProducts} products to one design." } });

        // Only this store's categories / products are kept.
        if (categoryIds.Count > 0)
            categoryIds = await db.Categories.Where(c => c.TenantId == TenantId && categoryIds.Contains(c.Id)).Select(c => c.Id).ToListAsync(ct);
        if (productIds.Count > 0)
            productIds = await db.Products.Where(p => p.TenantId == TenantId && productIds.Contains(p.Id)).Select(p => p.Id).ToListAsync(ct);

        var others = await db.StorefrontPages
            .Where(p => p.TenantId == TenantId && p.PageType == StorefrontPageType.AltProductTemplate && p.Id != id && p.AssignmentJson != null)
            .ToListAsync(ct);
        foreach (var other in others)
        {
            var a = ProductTemplateAssignment.Parse(other.AssignmentJson);
            var next = new ProductTemplateAssignment(
                a.CategoryIds!.Where(x => !categoryIds.Contains(x)).ToList(),
                a.ProductIds!.Where(x => !productIds.Contains(x)).ToList());
            if (next.CategoryIds!.Count != a.CategoryIds!.Count || next.ProductIds!.Count != a.ProductIds!.Count)
                other.AssignmentJson = next.ToJson();
        }

        page.AssignmentJson = new ProductTemplateAssignment(categoryIds, productIds).ToJson();
        await db.SaveChangesAsync(ct);
        return Ok(ToDetail(page));
    }

    // ── Shareable preview link ────────────────────────────────────────────────

    /// <summary>The store's draft preview token (null = no link). The editor builds the URL.</summary>
    [HttpGet("preview-link")]
    public async Task<IActionResult> GetPreviewLink(CancellationToken ct)
    {
        var token = await db.StorefrontThemes.Where(t => t.TenantId == TenantId).Select(t => t.PreviewToken).FirstOrDefaultAsync(ct);
        return Ok(new { token });
    }

    /// <summary>
    /// Creates the preview link, or replaces it (the old link stops working). Anyone with the link sees the
    /// saved drafts, read-only, until it is turned off or regenerated (SB-R22).
    /// </summary>
    [HttpPost("preview-link")]
    public async Task<IActionResult> CreatePreviewLink(CancellationToken ct)
    {
        var theme = await db.StorefrontThemes.FirstOrDefaultAsync(t => t.TenantId == TenantId, ct);
        if (theme is null) return Conflict(new { errors = new[] { "Save your design first, then share a preview." } });
        theme.PreviewToken = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();
        await db.SaveChangesAsync(ct);
        return Ok(new { token = theme.PreviewToken });
    }

    [HttpDelete("preview-link")]
    public async Task<IActionResult> DeletePreviewLink(CancellationToken ct)
    {
        var theme = await db.StorefrontThemes.FirstOrDefaultAsync(t => t.TenantId == TenantId, ct);
        if (theme?.PreviewToken is not null)
        {
            theme.PreviewToken = null;
            await db.SaveChangesAsync(ct);
        }
        return NoContent();
    }

    // ── Version history ───────────────────────────────────────────────────────

    /// <summary>The last <see cref="MaxVersions"/> publishes, newest first.</summary>
    [HttpGet("versions")]
    public async Task<IActionResult> ListVersions(CancellationToken ct)
    {
        var versions = await db.StorefrontVersions.AsNoTracking()
            .Where(v => v.TenantId == TenantId)
            .OrderByDescending(v => v.PublishedAt)
            .Select(v => new { v.Id, v.Version, v.PublishedAt, v.PageCount, v.CreatedBy })
            .ToListAsync(ct);

        var userIds = versions.Where(v => v.CreatedBy.HasValue).Select(v => v.CreatedBy!.Value).Distinct().ToList();
        var names = userIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await db.Users.AsNoTracking().Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.Name, ct);

        return Ok(versions.Select(v => new
        {
            v.Id, v.Version, v.PublishedAt, v.PageCount,
            PublishedBy = v.CreatedBy is { } uid && names.TryGetValue(uid, out var n) ? n : null,
        }));
    }

    /// <summary>One snapshot: the site document and every published page's layout (used for preview).</summary>
    [HttpGet("versions/{id:guid}")]
    public async Task<IActionResult> GetVersion(Guid id, CancellationToken ct)
    {
        var v = await db.StorefrontVersions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.TenantId == TenantId, ct);
        if (v is null) return NotFound();
        return Ok(new { v.Id, v.Version, v.PublishedAt, Site = JsonNode.Parse(v.SiteJson), Pages = JsonNode.Parse(v.PagesJson) });
    }

    /// <summary>
    /// Copies a snapshot into the <b>drafts</b> (nothing goes live until Publish, SB-R19). Pages are matched by id,
    /// then by page type (system pages) or slug (custom pages); custom pages deleted since are recreated.
    /// Pages created after the snapshot are left as they are.
    /// </summary>
    [HttpPost("versions/{id:guid}/restore")]
    public async Task<IActionResult> RestoreVersion(Guid id, CancellationToken ct)
    {
        var v = await db.StorefrontVersions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.TenantId == TenantId, ct);
        if (v is null) return NotFound();

        string siteJson;
        try { siteJson = processor.PrepareSiteDocument(v.SiteJson, ImageRules); }
        catch (StorefrontLayoutValidationException ex) { return BadRequest(new { errors = ex.Errors.Select(e => $"site.{e}") }); }

        var snapshots = JsonSerializer.Deserialize<List<VersionPage>>(v.PagesJson, SnapshotJson) ?? new();
        var prepared = new List<(VersionPage Page, StorefrontPageType Type, string Layout)>();
        foreach (var sp in snapshots)
        {
            var type = ParsePageType(sp.PageType);
            if (type is null || sp.Layout is null) continue;
            try { prepared.Add((sp, type.Value, processor.PreparePageLayout(sp.Layout.ToJsonString(), ImageRules))); }
            catch (StorefrontLayoutValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors.Select(e => $"{(sp.Title ?? type.ToString())}: {e}") });
            }
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

        var existing = await db.StorefrontPages.Where(p => p.TenantId == TenantId).ToListAsync(ct);
        var takenSlugs = existing.Select(p => p.Slug).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var touched = new List<StorefrontPage>();
        foreach (var (sp, type, layout) in prepared)
        {
            var page = existing.FirstOrDefault(x => x.Id == sp.PageId && x.PageType == type)
                ?? (IsMultiPage(type)
                    ? existing.FirstOrDefault(x => x.PageType == type && string.Equals(x.Slug, sp.Slug, StringComparison.OrdinalIgnoreCase))
                    : existing.FirstOrDefault(x => x.PageType == type));
            if (page is not null && touched.Contains(page)) continue;

            if (page is null)
            {
                var baseSlug = type == StorefrontPageType.Custom
                    ? Slugify(string.IsNullOrWhiteSpace(sp.Slug) ? sp.Title ?? "page" : sp.Slug)
                    : type == StorefrontPageType.AltProductTemplate
                        ? (sp.Slug is { Length: > 0 } altSlug && altSlug.StartsWith(AltSlugPrefix) ? altSlug : AltSlugPrefix + Slugify(sp.Title ?? "design"))
                        : "__" + Slugify(type.ToString());
                if (baseSlug.Length == 0) baseSlug = "page";
                var slug = baseSlug;
                for (var n = 2; takenSlugs.Contains(slug); n++) slug = $"{baseSlug}-{n}";
                takenSlugs.Add(slug);
                var title = string.IsNullOrWhiteSpace(sp.Title) ? type.ToString() : sp.Title.Trim();
                page = new StorefrontPage
                {
                    TenantId     = TenantId,
                    PageType     = type,
                    Title        = title.Length > 200 ? title[..200] : title,
                    Slug         = slug,
                    IsPublished  = sp.IsPublished,
                    ShowInNav    = sp.ShowInNav,
                    ShowInFooter = sp.ShowInFooter,
                    SortOrder    = sp.SortOrder,
                };
                db.StorefrontPages.Add(page);
                existing.Add(page);
            }
            page.DraftLayoutJson = layout;
            touched.Add(page);
        }

        await db.SaveChangesAsync(ct);
        return Ok(new
        {
            updatedAt = theme.UpdatedAt ?? theme.CreatedAt,
            site  = JsonNode.Parse(siteJson),
            pages = touched.Select(p => new
            {
                p.Id, p.Title, p.Slug, PageType = p.PageType.ToString(),
                Layout = JsonNode.Parse(p.DraftLayoutJson!),
            }),
        });
    }

    // ── Saved sections ────────────────────────────────────────────────────────

    [HttpGet("saved-sections")]
    public async Task<IActionResult> ListSavedSections(CancellationToken ct)
    {
        var rows = await db.StorefrontSavedSections.AsNoTracking()
            .Where(s => s.TenantId == TenantId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);
        return Ok(rows.Select(ToSavedDetail));
    }

    /// <summary>Saves one section (validated like a page layout) for reuse on any page. At most <see cref="MaxSavedSections"/>.</summary>
    [HttpPost("saved-sections")]
    public async Task<IActionResult> CreateSavedSection([FromBody] SaveSectionRequest req, CancellationToken ct)
    {
        var name = (req.Name ?? string.Empty).Trim();
        if (name.Length == 0) return BadRequest(new { errors = new[] { "name: required." } });
        if (name.Length > 100) name = name[..100];
        if (req.Section.ValueKind != JsonValueKind.Object) return BadRequest(new { errors = new[] { "section: required." } });

        if (await db.StorefrontSavedSections.CountAsync(s => s.TenantId == TenantId, ct) >= MaxSavedSections)
            return Conflict(new { errors = new[] { $"You can keep up to {MaxSavedSections} saved sections. Delete one first." } });

        // Validate as a one-section page so the same rules (types, ids, images, sizes) apply.
        var wrapper = new JsonObject { ["schemaVersion"] = 1, ["sections"] = new JsonArray(JsonNode.Parse(req.Section.GetRawText())) };
        JsonNode section;
        try { section = JsonNode.Parse(processor.PreparePageLayout(wrapper.ToJsonString(), ImageRules))!["sections"]![0]!; }
        catch (StorefrontLayoutValidationException ex) { return BadRequest(new { errors = ex.Errors.Select(e => e.Replace("sections[0].", "section.")) }); }

        var type = section["type"]?.GetValue<string>() ?? string.Empty;
        if (type.Length > 60) return BadRequest(new { errors = new[] { "section.type: too long." } });

        var row = new StorefrontSavedSection { TenantId = TenantId, Name = name, SectionType = type, SectionJson = section.ToJsonString() };
        db.StorefrontSavedSections.Add(row);
        await db.SaveChangesAsync(ct);
        return Ok(ToSavedDetail(row));
    }

    [HttpPut("saved-sections/{id:guid}")]
    public async Task<IActionResult> RenameSavedSection(Guid id, [FromBody] RenameSavedSectionRequest req, CancellationToken ct)
    {
        var row = await db.StorefrontSavedSections.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == TenantId, ct);
        if (row is null) return NotFound();
        var name = (req.Name ?? string.Empty).Trim();
        if (name.Length == 0) return BadRequest(new { errors = new[] { "name: required." } });
        row.Name = name.Length > 100 ? name[..100] : name;
        await db.SaveChangesAsync(ct);
        return Ok(ToSavedDetail(row));
    }

    [HttpDelete("saved-sections/{id:guid}")]
    public async Task<IActionResult> DeleteSavedSection(Guid id, CancellationToken ct)
    {
        var row = await db.StorefrontSavedSections.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == TenantId, ct);
        if (row is null) return NotFound();
        row.IsDeleted = true;
        row.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private const int MaxVersions = 10;
    private const int MaxAssignedCategories = 200;
    private const int MaxAssignedProducts = 200;
    /// <summary>Slug prefix of extra product designs (never routed; "__" keeps them out of custom page slugs).</summary>
    private const string AltSlugPrefix = "__product-";

    /// <summary>Page types a store can have many of (everything else is one per store).</summary>
    private static bool IsMultiPage(StorefrontPageType type) =>
        type is StorefrontPageType.Custom or StorefrontPageType.AltProductTemplate;
    private const int MaxSavedSections = 50;
    private static readonly JsonSerializerOptions SnapshotJson = new(JsonSerializerDefaults.Web);

    /// <summary>
    /// Adds a version row for what is now live (site + every page with a published layout) and prunes
    /// older rows so only the newest <see cref="MaxVersions"/> remain. Saved by the caller's SaveChanges.
    /// </summary>
    private async Task SnapshotVersionAsync(StorefrontTheme theme, DateTime now, CancellationToken ct)
    {
        // Tracked entities come back with this request's in-memory changes, so filter after loading.
        var live = (await db.StorefrontPages.Where(p => p.TenantId == TenantId).ToListAsync(ct))
            .Where(p => p.PublishedLayoutJson is not null)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Title)
            .Select(p => new VersionPage(p.Id, p.PageType.ToString(), p.Title, p.Slug, p.IsPublished, p.ShowInNav,
                p.ShowInFooter, p.SortOrder, JsonNode.Parse(p.PublishedLayoutJson!)))
            .ToList();

        var stale = await db.StorefrontVersions
            .Where(v => v.TenantId == TenantId)
            .OrderByDescending(v => v.PublishedAt)
            .Skip(MaxVersions - 1)
            .ToListAsync(ct);
        db.StorefrontVersions.RemoveRange(stale);

        db.StorefrontVersions.Add(new StorefrontVersion
        {
            TenantId    = TenantId,
            Version     = theme.Version,
            PublishedAt = now,
            SiteJson    = theme.PublishedJson!,
            PagesJson   = JsonSerializer.Serialize(live, SnapshotJson),
            PageCount   = live.Count,
        });
    }

    private static object ToSavedDetail(StorefrontSavedSection s) => new
    {
        s.Id, s.Name, s.SectionType, CreatedAt = s.CreatedAt,
        Section = JsonNode.Parse(s.SectionJson),
    };

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
        else if (isNew && page.PageType == StorefrontPageType.AltProductTemplate)
        {
            // Never routed by slug; unique so several designs can coexist.
            page.Slug = await UniqueSlugAsync(AltSlugPrefix + (Slugify(page.Title) is { Length: > 0 } s ? s : "design"), null, ct);
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
        Assignment = p.PageType == StorefrontPageType.AltProductTemplate ? ProductTemplateAssignment.Parse(p.AssignmentJson) : null,
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

/// <summary>Categories and products that use an extra product design (<c>StorefrontPage.AssignmentJson</c>).</summary>
public record ProductTemplateAssignment(List<Guid>? CategoryIds, List<Guid>? ProductIds)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    /// <summary>Never null lists; bad / empty JSON reads as "nothing assigned".</summary>
    public static ProductTemplateAssignment Parse(string? json)
    {
        ProductTemplateAssignment? a = null;
        if (!string.IsNullOrWhiteSpace(json))
        {
            try { a = JsonSerializer.Deserialize<ProductTemplateAssignment>(json, Json); }
            catch (JsonException) { a = null; }
        }
        return new ProductTemplateAssignment(a?.CategoryIds ?? new(), a?.ProductIds ?? new());
    }

    public string ToJson() => JsonSerializer.Serialize(this, Json);
}

/// <summary>Body of <c>POST saved-sections</c>: a display name and one section object from a page layout.</summary>
public record SaveSectionRequest(string? Name, JsonElement Section);

public record RenameSavedSectionRequest(string? Name);

/// <summary>One page inside a <see cref="StorefrontVersion"/> snapshot (<c>PagesJson</c>).</summary>
public record VersionPage(Guid PageId, string PageType, string? Title, string? Slug, bool IsPublished, bool ShowInNav,
    bool ShowInFooter, int SortOrder, JsonNode? Layout);

/// <summary>Resolved palette colours sent by the editor on publish.</summary>
public record BrandColors(string Primary, string Secondary, string? Accent);
