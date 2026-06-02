using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Campaigns;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Catalog.Commands;

/// <summary>
/// Fires an autonomous marketing campaign when a product transitions to Active status.
/// Generates AI content, posts to Instagram + Facebook, and broadcasts via WhatsApp.
/// Designed to be dispatched as a background job from CreateProduct / UpdateProduct.
/// </summary>
public record AutoLaunchCampaignCommand(
    Guid TenantId,
    Guid ProductId,
    string ProductTitle,
    string? ProductDescription,
    string? ProductImageUrl
) : IRequest;

public class AutoLaunchCampaignCommandHandler(
    IAppDbContext db,
    IAiProvider aiProvider,
    IInstagramService instagram,
    IFacebookService facebook,
    IWhatsAppService whatsApp)
    : IRequestHandler<AutoLaunchCampaignCommand>
{
    public async Task Handle(AutoLaunchCampaignCommand request, CancellationToken ct)
    {
        // Load business settings (ignore global tenant filter by using TenantId directly)
        var business = await db.Businesses
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.TenantId == request.TenantId, ct);

        if (business?.AutoCampaignEnabled != true) return;

        // Create the AutoCampaign record (Pending)
        var campaign = new AutoCampaign
        {
            Id          = Guid.NewGuid(),
            TenantId    = request.TenantId,
            ProductId   = request.ProductId,
            ProductName = request.ProductTitle,
            Status      = AutoCampaignStatus.Pending
        };
        db.AutoCampaigns.Add(campaign);
        await db.SaveChangesAsync(ct);

        // ── 1. Generate AI content ────────────────────────────────────────────
        campaign.Status = AutoCampaignStatus.Processing;

        AutoCampaignContent? content = null;
        var errors = new List<string>();

        try
        {
            content = await aiProvider.GenerateAutoCampaignContentAsync(
                productName:        request.ProductTitle,
                productDescription: request.ProductDescription,
                businessName:       business.Name,
                tone:               business.AutoReplyTone,
                language:           business.Language,
                cancellationToken:  ct);

            campaign.GeneratedCaption  = content.InstagramCaption;
            campaign.GeneratedHashtags = content.Hashtags;
            campaign.GeneratedCta      = content.Cta;
            campaign.GeneratedImageUrl = request.ProductImageUrl;
        }
        catch (Exception ex)
        {
            errors.Add($"AI generation failed: {ex.Message}");
            campaign.Status  = AutoCampaignStatus.Failed;
            campaign.ErrorLog = string.Join("; ", errors);
            await db.SaveChangesAsync(ct);
            return;
        }

        // ── 2. Post to Instagram ──────────────────────────────────────────────
        if (instagram.IsConfigured && !string.IsNullOrWhiteSpace(request.ProductImageUrl))
        {
            try
            {
                var igCaption = $"{content.InstagramCaption}\n\n{content.Hashtags}";
                var postId    = await instagram.CreatePhotoPostAsync(
                    request.ProductImageUrl, igCaption, ct);
                campaign.PostedToInstagram = postId != null;
                campaign.InstagramPostId   = postId;
            }
            catch (Exception ex)
            {
                errors.Add($"Instagram post failed: {ex.Message}");
            }
        }

        // ── 3. Post to Facebook ───────────────────────────────────────────────
        if (facebook.IsConfigured)
        {
            try
            {
                var fbMessage = $"{content.FacebookCaption}\n\n{content.Hashtags}";
                var postId    = await facebook.CreatePagePostAsync(
                    fbMessage, request.ProductImageUrl, ct);
                campaign.PostedToFacebook = postId != null;
                campaign.FacebookPostId   = postId;
            }
            catch (Exception ex)
            {
                errors.Add($"Facebook post failed: {ex.Message}");
            }
        }

        // ── 4. WhatsApp broadcast to customers ────────────────────────────────
        if (whatsApp.IsConfigured)
        {
            try
            {
                // Fetch opted-in customer phones (existing customers for this tenant)
                var phones = await db.Customers
                    .AsNoTracking()
                    .Where(c => c.TenantId == request.TenantId
                             && !string.IsNullOrEmpty(c.PhoneNumber)
                             && !c.IsDeleted)
                    .Select(c => c.PhoneNumber)
                    .Take(500)     // safety cap per broadcast
                    .ToListAsync(ct);

                if (phones.Count > 0)
                {
                    var sent = await whatsApp.BroadcastTextMessageAsync(phones, content.WhatsAppMessage, ct);
                    campaign.SentViaWhatsAppBroadcast = sent > 0;
                    campaign.WhatsAppRecipientsCount  = sent;
                }
            }
            catch (Exception ex)
            {
                errors.Add($"WhatsApp broadcast failed: {ex.Message}");
            }
        }

        // ── 5. Finalise ───────────────────────────────────────────────────────
        campaign.CompletedAt = DateTime.UtcNow;
        campaign.Status = errors.Count == 0
            ? AutoCampaignStatus.Completed
            : (campaign.PostedToInstagram || campaign.PostedToFacebook || campaign.SentViaWhatsAppBroadcast)
                ? AutoCampaignStatus.Partial
                : AutoCampaignStatus.Failed;

        if (errors.Count > 0)
            campaign.ErrorLog = string.Join("; ", errors);

        await db.SaveChangesAsync(ct);
    }
}
