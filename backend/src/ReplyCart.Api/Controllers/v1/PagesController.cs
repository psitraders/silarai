using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Storefront;
using ReplyCart.Infrastructure.Persistence;
using System.Text.RegularExpressions;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Tenant-owned custom storefront pages (About Us, Contact, Policies etc.)
/// </summary>
[ApiController]
[Route("api/v1/pages")]
[Authorize]
public class PagesController(
    AppDbContext db,
    ITenantContext tenantContext) : ControllerBase
{
    private Guid TenantId => tenantContext.CurrentTenantId;

    // ── List ──────────────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var pages = await db.StorefrontPages
            .Where(p => p.TenantId == TenantId)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Title)
            .Select(p => new
            {
                p.Id, p.Title, p.Slug, p.IsPublished,
                p.ShowInNav, p.ShowInFooter, p.SortOrder, p.CreatedAt,
            })
            .ToListAsync(ct);
        return Ok(pages);
    }

    // ── Get single (with content) ─────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var page = await db.StorefrontPages
            .Where(p => p.Id == id && p.TenantId == TenantId)
            .FirstOrDefaultAsync(ct);
        if (page == null) return NotFound();
        return Ok(page);
    }

    // ── Create ────────────────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertPageRequest req, CancellationToken ct)
    {
        var slug = GenerateSlug(req.Slug ?? req.Title);

        // Ensure slug is unique within tenant
        slug = await EnsureUniqueSlug(slug, null, ct);

        var page = new StorefrontPage
        {
            Id           = Guid.NewGuid(),
            TenantId     = TenantId,
            Title        = req.Title.Trim(),
            Slug         = slug,
            Content      = req.Content ?? string.Empty,
            IsPublished  = req.IsPublished ?? true,
            ShowInNav    = req.ShowInNav ?? false,
            ShowInFooter = req.ShowInFooter ?? false,
            SortOrder    = req.SortOrder ?? 0,
            CreatedAt    = DateTime.UtcNow,
        };

        db.StorefrontPages.Add(page);
        await db.SaveChangesAsync(ct);
        return Ok(new { page.Id, page.Slug });
    }

    // ── Update ────────────────────────────────────────────────────────────────
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertPageRequest req, CancellationToken ct)
    {
        var page = await db.StorefrontPages
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == TenantId, ct);
        if (page == null) return NotFound();

        var slug = GenerateSlug(req.Slug ?? req.Title);
        slug = await EnsureUniqueSlug(slug, id, ct);

        page.Title        = req.Title.Trim();
        page.Slug         = slug;
        page.Content      = req.Content ?? string.Empty;
        page.IsPublished  = req.IsPublished ?? page.IsPublished;
        page.ShowInNav    = req.ShowInNav ?? page.ShowInNav;
        page.ShowInFooter = req.ShowInFooter ?? page.ShowInFooter;
        page.SortOrder    = req.SortOrder ?? page.SortOrder;
        page.UpdatedAt    = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var page = await db.StorefrontPages
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == TenantId, ct);
        if (page == null) return NotFound();
        db.StorefrontPages.Remove(page);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static string GenerateSlug(string input)
    {
        var s = input.ToLowerInvariant().Trim();
        s = Regex.Replace(s, @"[^a-z0-9\s-]", "");
        s = Regex.Replace(s, @"\s+", "-");
        s = Regex.Replace(s, @"-+", "-").Trim('-');
        return s.Length > 80 ? s[..80] : s;
    }

    private async Task<string> EnsureUniqueSlug(string slug, Guid? excludeId, CancellationToken ct)
    {
        var exists = await db.StorefrontPages
            .AnyAsync(p => p.TenantId == TenantId && p.Slug == slug && p.Id != excludeId, ct);
        if (!exists) return slug;
        var counter = 2;
        string candidate;
        do { candidate = $"{slug}-{counter++}"; }
        while (await db.StorefrontPages.AnyAsync(p => p.TenantId == TenantId && p.Slug == candidate && p.Id != excludeId, ct));
        return candidate;
    }
}

public record UpsertPageRequest(
    string  Title,
    string? Slug,
    string? Content,
    bool?   IsPublished,
    bool?   ShowInNav,
    bool?   ShowInFooter,
    int?    SortOrder
);


