using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Queries;

public record BusinessDto(
    Guid Id, string Name, string Category, string? Description, string? LogoUrl,
    string? WhatsAppNumber, string? InstagramHandle, string? FacebookPageUrl,
    string Currency, string? WelcomeText, string? DeliveryInfo, bool IsOnboardingComplete
);

public record GetBusinessQuery : IRequest<BusinessDto?>;

public class GetBusinessQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetBusinessQuery, BusinessDto?>
{
    public async Task<BusinessDto?> Handle(GetBusinessQuery request, CancellationToken cancellationToken)
    {
        var b = await db.Businesses.FirstOrDefaultAsync(
            x => x.TenantId == tenantContext.CurrentTenantId, cancellationToken);

        return b is null ? null : new BusinessDto(
            b.Id, b.Name, b.Category, b.Description, b.LogoUrl,
            b.WhatsAppNumber, b.InstagramHandle, b.FacebookPageUrl,
            b.Currency, b.WelcomeText, b.DeliveryInfo, b.IsOnboardingComplete
        );
    }
}
