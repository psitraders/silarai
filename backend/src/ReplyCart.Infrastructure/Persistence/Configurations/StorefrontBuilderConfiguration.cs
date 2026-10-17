using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Storefront;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class StorefrontThemeConfiguration : IEntityTypeConfiguration<StorefrontTheme>
{
    public void Configure(EntityTypeBuilder<StorefrontTheme> builder)
    {
        builder.Property(t => t.DraftJson).IsRequired();
        builder.HasIndex(t => t.TenantId).IsUnique();
    }
}

public class StorefrontPageConfiguration : IEntityTypeConfiguration<StorefrontPage>
{
    public void Configure(EntityTypeBuilder<StorefrontPage> builder)
    {
        builder.Property(p => p.Title).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(120).IsRequired();
        builder.Property(p => p.SeoTitle).HasMaxLength(200);
        builder.Property(p => p.SeoDescription).HasMaxLength(500);
        builder.Property(p => p.OgImageUrl).HasMaxLength(1000);

        // Slug uniqueness is enforced in code (soft-deleted rows may share a slug).
        builder.HasIndex(p => new { p.TenantId, p.Slug });
        builder.HasIndex(p => new { p.TenantId, p.PageType });
    }
}
