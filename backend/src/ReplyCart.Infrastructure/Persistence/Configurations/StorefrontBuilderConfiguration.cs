using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Storefront;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class StorefrontThemeConfiguration : IEntityTypeConfiguration<StorefrontTheme>
{
    public void Configure(EntityTypeBuilder<StorefrontTheme> builder)
    {
        builder.Property(t => t.DraftJson).IsRequired();
        builder.Property(t => t.PreviewToken).HasMaxLength(64);
        builder.HasIndex(t => t.TenantId).IsUnique();
    }
}

public class StorefrontVersionConfiguration : IEntityTypeConfiguration<StorefrontVersion>
{
    public void Configure(EntityTypeBuilder<StorefrontVersion> builder)
    {
        builder.Property(v => v.SiteJson).IsRequired();
        builder.Property(v => v.PagesJson).IsRequired();
        builder.HasIndex(v => new { v.TenantId, v.PublishedAt });
    }
}

public class StorefrontSavedSectionConfiguration : IEntityTypeConfiguration<StorefrontSavedSection>
{
    public void Configure(EntityTypeBuilder<StorefrontSavedSection> builder)
    {
        builder.Property(s => s.Name).HasMaxLength(100).IsRequired();
        builder.Property(s => s.SectionType).HasMaxLength(60).IsRequired();
        builder.Property(s => s.SectionJson).IsRequired();
        builder.HasIndex(s => s.TenantId);
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
