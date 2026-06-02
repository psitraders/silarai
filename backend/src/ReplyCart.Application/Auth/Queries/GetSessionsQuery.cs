using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Queries;

public record GetSessionsQuery(Guid UserId) : IRequest<IEnumerable<SessionDto>>;

public record SessionDto(
    Guid Id,
    string? DeviceInfo,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    bool IsCurrent
);

public class GetSessionsQueryHandler(IAppDbContext db)
    : IRequestHandler<GetSessionsQuery, IEnumerable<SessionDto>>
{
    public async Task<IEnumerable<SessionDto>> Handle(GetSessionsQuery request, CancellationToken cancellationToken)
    {
        var tokens = await db.UserRefreshTokens
            .Where(t => t.UserId == request.UserId && !t.IsRevoked && t.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return tokens.Select((t, i) => new SessionDto(
            t.Id,
            t.DeviceInfo,
            t.CreatedAt,
            t.ExpiresAt,
            i == 0   // most-recent is "current"
        ));
    }
}
