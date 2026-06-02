using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.CustomerName).HasMaxLength(200).IsRequired();
        builder.Property(l => l.CustomerPhone).HasMaxLength(20);
        builder.Property(l => l.CustomerEmail).HasMaxLength(300);

        builder.HasIndex(l => new { l.TenantId, l.Status, l.AssignedUserId });
        builder.HasIndex(l => new { l.TenantId, l.FollowUpDate });

        builder.HasMany(l => l.Notes).WithOne(n => n.Lead).HasForeignKey(n => n.LeadId);
        builder.HasMany(l => l.Activities).WithOne(a => a.Lead).HasForeignKey(a => a.LeadId);
    }
}
