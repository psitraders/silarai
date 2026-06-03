using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Storefront;

namespace ReplyCart.Application.Storefront.Commands;

// ── Upsert tiers (merchant) ───────────────────────────────────────────────────

public record UpsertWholesaleTiersCommand(
    Guid ProductId,
    List<WholesaleTierInput> Tiers
) : IRequest;

public record WholesaleTierInput(int MinQuantity, int? MaxQuantity, decimal PricePerUnit, string? Label);

public class UpsertWholesaleTiersHandler(IAppDbContext db, ITenantContext tenant)
    : IRequestHandler<UpsertWholesaleTiersCommand>
{
    public async Task Handle(UpsertWholesaleTiersCommand req, CancellationToken ct)
    {
        var tenantId = tenant.CurrentTenantId;
        var now      = DateTime.UtcNow;

        // Load and HARD-DELETE existing tiers (RemoveRange issues DELETE SQL — not soft-delete)
        var existing = await db.ProductWholesaleTiers
            .Where(t => t.ProductId == req.ProductId)
            .ToListAsync(ct);

        if (existing.Count > 0)
            db.ProductWholesaleTiers.RemoveRange(existing);

        // Insert fresh tiers
        foreach (var input in req.Tiers)
        {
            db.ProductWholesaleTiers.Add(new ProductWholesaleTier
            {
                Id           = Guid.NewGuid(),
                TenantId     = tenantId,
                ProductId    = req.ProductId,
                MinQuantity  = input.MinQuantity,
                MaxQuantity  = input.MaxQuantity,
                PricePerUnit = input.PricePerUnit,
                Label        = input.Label,
                CreatedAt    = now,
                IsDeleted    = false,
            });
        }

        await db.SaveChangesAsync(ct);
    }
}

// ── Get tiers (merchant + public) ────────────────────────────────────────────

public record GetWholesaleTiersQuery(Guid ProductId) : IRequest<List<WholesaleTierDto>>;

public record WholesaleTierDto(
    Guid Id,
    int MinQuantity,
    int? MaxQuantity,
    decimal PricePerUnit,
    string? Label
);

public class GetWholesaleTiersHandler(IAppDbContext db)
    : IRequestHandler<GetWholesaleTiersQuery, List<WholesaleTierDto>>
{
    public async Task<List<WholesaleTierDto>> Handle(GetWholesaleTiersQuery req, CancellationToken ct)
    {
        return await db.ProductWholesaleTiers
            .Where(t => t.ProductId == req.ProductId)
            .OrderBy(t => t.MinQuantity)
            .Select(t => new WholesaleTierDto(t.Id, t.MinQuantity, t.MaxQuantity, t.PricePerUnit, t.Label))
            .ToListAsync(ct);
    }
}


