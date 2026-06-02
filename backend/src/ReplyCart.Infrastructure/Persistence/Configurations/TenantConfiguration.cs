using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Tenancy;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(100).IsRequired();
        builder.Property(t => t.ContactEmail).HasMaxLength(300).IsRequired();

        builder.HasIndex(t => t.Slug).IsUnique();
        builder.HasIndex(t => t.ContactEmail).IsUnique();
    }
}
