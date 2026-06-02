using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Application.Orders.Commands;

public record CreateOrderCommand(
    Guid? CustomerId,
    Guid? SourceLeadId,
    SocialPlatform SourceChannel,
    string? CustomerName,
    string? CustomerPhone,
    string? DeliveryAddress,
    string? Notes,
    IEnumerable<OrderItemRequest> Items
) : IRequest<Guid>;

public record OrderItemRequest(Guid ProductId, string ProductTitle, string? VariantInfo, int Quantity, decimal UnitPrice);

public class CreateOrderCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateOrderCommand, Guid>
{
    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        // Compute total early so we can update customer spend
        var totalAmount = request.Items.Sum(i => i.Quantity * i.UnitPrice);

        // Auto-create or update customer from order details.
        // Create a customer record whenever a name OR phone is provided,
        // even if the phone is absent — prevents silent data loss.
        var resolvedCustomerId = request.CustomerId;
        if (resolvedCustomerId == null &&
            (!string.IsNullOrWhiteSpace(request.CustomerPhone) || !string.IsNullOrWhiteSpace(request.CustomerName)))
        {
            ReplyCart.Domain.Customers.Customer? existingCustomer = null;

            if (!string.IsNullOrWhiteSpace(request.CustomerPhone))
            {
                existingCustomer = await db.Customers
                    .FirstOrDefaultAsync(c => c.PhoneNumber == request.CustomerPhone, cancellationToken);
            }

            if (existingCustomer != null)
            {
                existingCustomer.TotalOrders += 1;
                existingCustomer.TotalSpend += totalAmount;
                existingCustomer.LastOrderDate = DateTime.UtcNow;
                resolvedCustomerId = existingCustomer.Id;
            }
            else
            {
                var newCustomer = new ReplyCart.Domain.Customers.Customer
                {
                    TenantId = tenantId,
                    Name = request.CustomerName ?? "Unknown",
                    PhoneNumber = request.CustomerPhone ?? string.Empty,
                    TotalOrders = 1,
                    TotalSpend = totalAmount,
                    LastOrderDate = DateTime.UtcNow,
                    PreferredChannel = request.SourceChannel,
                };
                db.Customers.Add(newCustomer);
                resolvedCustomerId = newCustomer.Id;
            }
        }

        var items = request.Items.Select(i => new OrderItem
        {
            TenantId = tenantId,
            ProductId = i.ProductId,
            ProductTitle = i.ProductTitle,
            VariantInfo = i.VariantInfo,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            TotalPrice = i.Quantity * i.UnitPrice
        }).ToList();

        var order = new Order
        {
            TenantId = tenantId,
            OrderNumber = orderNumber,
            CustomerId = resolvedCustomerId,
            SourceLeadId = request.SourceLeadId,
            SourceChannel = request.SourceChannel,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            DeliveryAddress = request.DeliveryAddress,
            Notes = request.Notes,
            TotalAmount = totalAmount,
            Items = items
        };

        order.StatusHistory.Add(new OrderStatusHistory
        {
            TenantId = tenantId,
            OrderId = order.Id,
            FromStatus = OrderStatus.New,
            ToStatus = OrderStatus.New,
            Note = "Order created"
        });

        // ── Stock validation (must happen before any writes) ──────────────────────
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null) continue;

            // Block if the product is already explicitly marked OutOfStock
            if (product.Status == ProductStatus.OutOfStock)
                throw new InsufficientStockException(product.Title, 0, item.Quantity);

            // Block if requested quantity exceeds tracked stock
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

        await db.SaveChangesAsync(cancellationToken);
        return order.Id;
    }
}
