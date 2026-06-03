using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Customers;

namespace ReplyCart.Application.Customers.Commands;

/// <summary>
/// Merges <see cref="SourceId"/> into <see cref="TargetId"/>.
/// All orders and leads from the source are re-linked to the target.
/// Source customer stats are added to target, then source is soft-deleted.
/// </summary>
public record MergeCustomersCommand(Guid TargetId, Guid SourceId) : IRequest;

public class MergeCustomersCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<MergeCustomersCommand>
{
    public async Task Handle(MergeCustomersCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        if (request.TargetId == request.SourceId)
            throw new InvalidOperationException("Cannot merge a customer with itself.");

        var target = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.TargetId && c.TenantId == tenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.TargetId);

        var source = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.SourceId && c.TenantId == tenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.SourceId);

        // Re-link orders
        var orders = await db.Orders
            .Where(o => o.CustomerId == source.Id)
            .ToListAsync(cancellationToken);
        foreach (var order in orders)
            order.CustomerId = target.Id;

        // Re-link leads
        var leads = await db.Leads
            .Where(l => l.CustomerId == source.Id)
            .ToListAsync(cancellationToken);
        foreach (var lead in leads)
            lead.CustomerId = target.Id;

        // Merge stats
        target.TotalOrders += source.TotalOrders;
        target.TotalSpend  += source.TotalSpend;
        if (source.LastOrderDate > target.LastOrderDate)
            target.LastOrderDate = source.LastOrderDate;

        // Merge notes and tags (append if target doesn't already have them)
        if (!string.IsNullOrWhiteSpace(source.Notes))
            target.Notes = string.IsNullOrWhiteSpace(target.Notes)
                ? source.Notes
                : $"{target.Notes}\n\n[Merged] {source.Notes}";

        if (!string.IsNullOrWhiteSpace(source.Tags))
        {
            var existingTags = (target.Tags ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim()).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var newTags = source.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => !existingTags.Contains(t));
            target.Tags = string.Join(", ", existingTags.Concat(newTags));
        }

        // Soft-delete source
        source.IsDeleted = true;
        source.DeletedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}


