using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReplyCart.Domain.Chatbot;

namespace ReplyCart.Infrastructure.Persistence.Configurations;

public class ChatbotSessionConfiguration : IEntityTypeConfiguration<ChatbotSession>
{
    public void Configure(EntityTypeBuilder<ChatbotSession> builder)
    {
        builder.Property(s => s.SessionId).HasMaxLength(128).IsRequired();
        builder.Property(s => s.Channel).HasMaxLength(30).IsRequired();
        builder.Property(s => s.State).HasMaxLength(40);
        builder.Property(s => s.CustomerName).HasMaxLength(200);
        builder.Property(s => s.CustomerPhone).HasMaxLength(40);
        builder.Property(s => s.DeliveryAddress).HasMaxLength(1000);
        builder.Property(s => s.PaymentMethod).HasMaxLength(20);

        // One row per (client, session) — the archive upserts on this pair.
        builder.HasIndex(s => new { s.ClientId, s.SessionId }).IsUnique();
        builder.HasIndex(s => new { s.ClientId, s.LastMessageAt });

        builder.HasMany(s => s.Messages)
               .WithOne(m => m.Session)
               .HasForeignKey(m => m.SessionRowId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ChatbotSessionMessageConfiguration : IEntityTypeConfiguration<ChatbotSessionMessage>
{
    public void Configure(EntityTypeBuilder<ChatbotSessionMessage> builder)
    {
        builder.Property(m => m.Role).HasMaxLength(20).IsRequired();
        builder.Property(m => m.Content).HasMaxLength(4000).IsRequired();

        builder.HasIndex(m => new { m.SessionRowId, m.Seq });
    }
}
