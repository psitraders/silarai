using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Commands;

public record UpdateBusinessCommand(
    string Name, string Category, string? Description,
    string? WhatsAppNumber, string? InstagramHandle, string? FacebookPageUrl,
    string Currency, string? WelcomeText, string? DeliveryInfo
) : IRequest;

public class UpdateBusinessCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateBusinessCommand>
{
    public async Task Handle(UpdateBusinessCommand request, CancellationToken cancellationToken)
    {
        var business = await db.Businesses.FirstOrDefaultAsync(
            b => b.TenantId == tenantContext.CurrentTenantId, cancellationToken);

        if (business is null)
        {
            business = new Domain.Business.Business
            {
                Id = Guid.NewGuid(),
                TenantId = tenantContext.CurrentTenantId,
            };
            db.Businesses.Add(business);
        }

        business.Name = request.Name;
        business.Category = request.Category;
        business.Description = request.Description;
        business.WhatsAppNumber = request.WhatsAppNumber;
        business.InstagramHandle = request.InstagramHandle;
        business.FacebookPageUrl = request.FacebookPageUrl;
        business.Currency = request.Currency;
        business.WelcomeText = request.WelcomeText;
        business.DeliveryInfo = request.DeliveryInfo;
        business.IsOnboardingComplete = true;

        await db.SaveChangesAsync(cancellationToken);
    }
}
