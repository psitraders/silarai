using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;

using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Application.Leads.Commands;

public record ConvertLeadToOrderCommand(Guid LeadId, List<OrderItemInput> Items, string? Notes) : IRequest<Guid>;
public record OrderItemInput(Guid ProductId, string ProductTitle, int Quantity, decimal UnitPrice);

public class ConvertLeadToOrderCommandHandler(IAppDbContext db, ITenantContext tenantContext, ICurrentUser currentUser)
    : IRequestHandler<ConvertLeadToOrderCommand, Guid>
{
    public async Task<Guid> Handle(ConvertLeadToOrderCommand request, CancellationToken cancellationToken)
    {
        var lead = await db.Leads.FirstOrDefaultAsync(l => l.Id == request.LeadId, cancellationToken)
            ?? throw new NotFoundException(nameof(Lead), request.LeadId);

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var total = request.Items.Sum(i => i.Quantity * i.UnitPrice);

        var order = new Order
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.CurrentTenantId,
            OrderNumber = orderNumber,
            CustomerId = lead.CustomerId,
            SourceLeadId = lead.Id,
            SourceChannel = lead.SourceChannel,
            CustomerName = lead.CustomerName,
            CustomerPhone = lead.CustomerPhone,
            TotalAmount = total,
            Status = OrderStatus.New,
            PaymentStatus = PaymentStatus.Pending,
            Notes = request.Notes,
            Items = request.Items.Select(i => new OrderItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantContext.CurrentTenantId,
                ProductId = i.ProductId,
                ProductTitle = i.ProductTitle,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.Quantity * i.UnitPrice
            }).ToList(),
            StatusHistory = [new OrderStatusHistory
            {
                Id = Guid.NewGuid(),
                TenantId = tenantContext.CurrentTenantId,
                FromStatus = OrderStatus.New,
                ToStatus = OrderStatus.New,
                Note = "Order created from lead conversion",
                ChangedBy = currentUser.UserId ?? Guid.Empty
            }]
        };
        // ── Stock validation (before any writes) ──────────────────────────────────
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null) continue;

            if (product.Status == ProductStatus.OutOfStock)
                throw new InsufficientStockException(product.Title, 0, item.Quantity);

            if (product.StockQuantity.HasValue && item.Quantity > product.StockQuantity.Value)
                throw new InsufficientStockException(product.Title, product.StockQuantity.Value, item.Quantity);
        }

        db.Orders.Add(order);

        // ── Decrement stock; auto-mark OutOfStock when stock hits 0 ──────────────
        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product?.StockQuantity != null)
            {
                product.StockQuantity = Math.Max(0, product.StockQuantity.Value - item.Quantity);
                if (product.StockQuantity <= 0 && product.Status == ProductStatus.Active)
                    product.Status = ProductStatus.OutOfStock;
            }
        }

        lead.Status = LeadStatus.OrderConfirmed;
        lead.LastActivityDate = DateTime.UtcNow;
        db.LeadActivities.Add(new LeadActivity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.CurrentTenantId,
            LeadId = lead.Id,
            ActivityType = "OrderCreated",
            Description = $"Converted to order {orderNumber}",
            PerformedBy = currentUser.UserId
        });

        await db.SaveChangesAsync(cancellationToken);
        return order.Id;
    }
}


