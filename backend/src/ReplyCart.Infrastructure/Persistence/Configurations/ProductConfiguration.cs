using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Catalog;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Title).HasMaxLength(300).IsRequired();
        builder.Property(p => p.Sku).HasMaxLength(100);
        builder.Property(p => p.BasePrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.DiscountedPrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Attributes).HasColumnType("nvarchar(max)");

        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => new { p.TenantId, p.CategoryId, p.Status });
        builder.HasIndex(p => new { p.TenantId, p.IsDeleted, p.CreatedAt });

        builder.HasMany(p => p.Images).WithOne(i => i.Product).HasForeignKey(i => i.ProductId);
        builder.HasMany(p => p.Variants).WithOne(v => v.Product).HasForeignKey(v => v.ProductId);
        builder.HasMany(p => p.Tags).WithOne(t => t.Product).HasForeignKey(t => t.ProductId);
    }
}
