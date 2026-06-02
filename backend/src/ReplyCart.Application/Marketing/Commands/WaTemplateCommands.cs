using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Marketing;

namespace ReplyCart.Application.Marketing.Commands;

// ── Create ────────────────────────────────────────────────────────────────────

public record CreateWaTemplateCommand(
    string  Name,
    string  DisplayName,
    string  Category,
    string  Language,
    string  Body,
    string? HeaderText,
    string? FooterText,
    string? VariablesJson
) : IRequest<Guid>;

public class CreateWaTemplateHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateWaTemplateCommand, Guid>
{
    public async Task<Guid> Handle(CreateWaTemplateCommand cmd, CancellationToken ct)
    {
        var template = new WaTemplate
        {
            TenantId      = tenantContext.CurrentTenantId,
            Name          = cmd.Name.Trim(),
            DisplayName   = cmd.DisplayName.Trim(),
            Category      = cmd.Category,
            Language      = cmd.Language,
            Body          = cmd.Body.Trim(),
            HeaderText    = cmd.HeaderText?.Trim(),
            FooterText    = cmd.FooterText?.Trim(),
            VariablesJson = cmd.VariablesJson,
            IsActive      = true,
            IsDefault     = false,
        };

        db.WaTemplates.Add(template);
        await db.SaveChangesAsync(ct);
        return template.Id;
    }
}

// ── Update ────────────────────────────────────────────────────────────────────

public record UpdateWaTemplateCommand(
    Guid    Id,
    string  Name,
    string  DisplayName,
    string  Category,
    string  Language,
    string  Body,
    string? HeaderText,
    string? FooterText,
    string? VariablesJson,
    bool    IsActive
) : IRequest;

public class UpdateWaTemplateHandler(IAppDbContext db)
    : IRequestHandler<UpdateWaTemplateCommand>
{
    public async Task Handle(UpdateWaTemplateCommand cmd, CancellationToken ct)
    {
        var template = await db.WaTemplates.FirstOrDefaultAsync(t => t.Id == cmd.Id, ct)
            ?? throw new KeyNotFoundException($"WaTemplate {cmd.Id} not found");

        template.Name          = cmd.Name.Trim();
        template.DisplayName   = cmd.DisplayName.Trim();
        template.Category      = cmd.Category;
        template.Language      = cmd.Language;
        template.Body          = cmd.Body.Trim();
        template.HeaderText    = cmd.HeaderText?.Trim();
        template.FooterText    = cmd.FooterText?.Trim();
        template.VariablesJson = cmd.VariablesJson;
        template.IsActive      = cmd.IsActive;

        await db.SaveChangesAsync(ct);
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────

public record DeleteWaTemplateCommand(Guid Id) : IRequest;

public class DeleteWaTemplateHandler(IAppDbContext db)
    : IRequestHandler<DeleteWaTemplateCommand>
{
    public async Task Handle(DeleteWaTemplateCommand cmd, CancellationToken ct)
    {
        var template = await db.WaTemplates.FirstOrDefaultAsync(t => t.Id == cmd.Id, ct)
            ?? throw new KeyNotFoundException($"WaTemplate {cmd.Id} not found");

        template.IsDeleted  = true;
        template.DeletedAt  = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}

// ── Send campaign via AiSensy ─────────────────────────────────────────────────

public record SendWaCampaignCommand(
    Guid            TemplateId,
    /// <summary>If null, sends to all customers with a phone number.</summary>
    List<string>?   PhoneNumbers,
    /// <summary>Variable values to substitute {{1}}, {{2}} etc.</summary>
    List<string>?   TemplateParams,
    string?         MediaUrl
) : IRequest<SendWaCampaignResult>;

public record SendWaCampaignResult(int Sent, int Failed, string Message);

public class SendWaCampaignHandler(IAppDbContext db, IWhatsAppService whatsApp)
    : IRequestHandler<SendWaCampaignCommand, SendWaCampaignResult>
{
    public async Task<SendWaCampaignResult> Handle(SendWaCampaignCommand cmd, CancellationToken ct)
    {
        var template = await db.WaTemplates.FirstOrDefaultAsync(t => t.Id == cmd.TemplateId, ct)
            ?? throw new KeyNotFoundException($"WaTemplate {cmd.TemplateId} not found");

        // Resolve recipients
        List<(string Phone, string Name)> recipients;
        if (cmd.PhoneNumbers is { Count: > 0 })
        {
            // Specific list supplied by the caller
            recipients = cmd.PhoneNumbers
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => (p.Trim(), "Customer"))
                .ToList();
        }
        else
        {
            // All customers for this tenant who have a phone number
            var customers = await db.Customers
                .Where(c => c.PhoneNumber != null && c.PhoneNumber != string.Empty)
                .Select(c => new { c.PhoneNumber, c.Name })
                .ToListAsync(ct);

            recipients = customers
                .Select(c => (c.PhoneNumber!, c.Name))
                .ToList();
        }

        if (recipients.Count == 0)
            return new SendWaCampaignResult(0, 0, "No recipients found.");

        var sent = await whatsApp.BroadcastCampaignAsync(
            recipients,
            template.Name,
            template.Language,
            cmd.TemplateParams,
            ct
        );

        return new SendWaCampaignResult(
            Sent:    sent,
            Failed:  recipients.Count - sent,
            Message: $"Campaign '{template.DisplayName}' sent to {sent} of {recipients.Count} recipients."
        );
    }
}
