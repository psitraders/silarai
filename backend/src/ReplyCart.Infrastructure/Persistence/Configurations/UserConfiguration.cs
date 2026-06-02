using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Name).HasMaxLength(200).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(300).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(u => u.Phone).HasMaxLength(20);

        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => new { u.TenantId, u.IsActive });
    }
}
