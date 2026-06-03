using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Ai.Commands;

public record GetSocialPostCommand(
    string ProductName,
    string? ProductDescription,
    string Platform,    // "Instagram" | "Facebook" | "WhatsApp" | "Twitter"
    string Tone,        // "Fun" | "Professional" | "Festive" | "Urgent"
    string? BusinessName,
    string Language = "English"
) : IRequest<SocialPostResult>;

public record SocialPostResult(string Caption, string Hashtags, string CallToAction);

public class GetSocialPostCommandHandler(
    IAppDbContext db,
    ITenantContext tenantContext,
    IAiProvider aiProvider)
    : IRequestHandler<GetSocialPostCommand, SocialPostResult>
{
    public async Task<SocialPostResult> Handle(GetSocialPostCommand request, CancellationToken cancellationToken)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, cancellationToken);

        var bizName = request.BusinessName ?? business?.Name ?? "our store";

        string caption, hashtags, cta;
        bool wasSuccessful;
        string usedProvider;

        try
        {
            (caption, hashtags, cta) = await aiProvider.GenerateSocialPostAsync(
                request.ProductName,
                request.ProductDescription,
                request.Platform,
                request.Tone,
                bizName,
                request.Language,
                cancellationToken);
            wasSuccessful = true;
            usedProvider  = aiProvider.ProviderName;
        }
        catch (Exception)
        {
            // AI call failed (rate limit, network, quota) — fall back to templates silently
            (caption, hashtags, cta) = BuildTemplatePost(request, bizName);
            wasSuccessful = false;
            usedProvider  = "Template-Fallback";
        }

        // Log AI usage
        db.AiUsageLogs.Add(new Domain.Ai.AiUsageLog
        {
            TenantId      = tenantContext.CurrentTenantId,
            RequestType   = "SocialPost",
            TokensUsed    = 0,
            Provider      = usedProvider,
            WasSuccessful = wasSuccessful
        });
        await db.SaveChangesAsync(cancellationToken);

        return new SocialPostResult(caption, hashtags, cta);
    }

    private static (string Caption, string Hashtags, string Cta) BuildTemplatePost(
        GetSocialPostCommand r, string biz)
    {
        var prod = r.ProductName;
        var desc = r.ProductDescription;

        return (r.Tone, r.Platform) switch
        {
            ("Fun", "Instagram") => (
                $"✨ Say hello to {prod}! 🎉 Life's too short for boring style — and this proves it. {desc ?? "Grab yours before it's gone!"}",
                $"#{prod.Replace(" ", "")} #Fashion #Style #OOTD #ShopNow #{biz.Replace(" ", "")} #Trending #NewArrival",
                "Tap the link in bio to order 🛒"),
            ("Professional", _) => (
                $"Introducing {prod} — crafted for those who demand quality. {desc ?? "Experience the difference."} Available now at {biz}.",
                $"#{prod.Replace(" ", "")} #Premium #Quality #{biz.Replace(" ", "")} #ShopNow",
                "DM us or visit our store link."),
            ("Festive", _) => (
                $"🎊 Celebrate in style with {prod}! Perfect for the festive season. {desc ?? "Make every moment special."} Shop now at {biz}! 🎆",
                $"#{prod.Replace(" ", "")} #FestiveSeason #{biz.Replace(" ", "")} #FestiveFashion #Sale",
                "Order via WhatsApp or visit our online store!"),
            ("Urgent", _) => (
                $"⚠️ LAST FEW LEFT! {prod} is selling out FAST. {desc ?? "Don't miss out!"} Limited stock at {biz}! ⏰",
                $"#{prod.Replace(" ", "")} #LimitedStock #HurryUp #{biz.Replace(" ", "")} #GetItNow",
                "Message us NOW on WhatsApp to reserve yours!"),
            _ => (
                $"Discover {prod} at {biz}. {desc ?? "Shop our latest collection online."}",
                $"#{prod.Replace(" ", "")} #{biz.Replace(" ", "")} #ShopOnline #NewCollection",
                "DM us or visit our store link!")
        };
    }
}


