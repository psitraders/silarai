using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderNumber).HasMaxLength(50).IsRequired();
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.CustomerName).HasMaxLength(200);
        builder.Property(o => o.CustomerPhone).HasMaxLength(20);

        builder.HasIndex(o => new { o.TenantId, o.Status, o.CreatedAt });
        builder.HasIndex(o => new { o.TenantId, o.CustomerId });
        builder.HasIndex(o => o.OrderNumber).IsUnique();

        builder.HasMany(o => o.Items).WithOne(i => i.Order).HasForeignKey(i => i.OrderId);
        builder.HasMany(o => o.Payments).WithOne(p => p.Order).HasForeignKey(p => p.OrderId);
        builder.HasMany(o => o.StatusHistory).WithOne(h => h.Order).HasForeignKey(h => h.OrderId);
    }
}
