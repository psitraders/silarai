using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Conversation;

namespace ReplyCart.Application.Conversation.Queries;

public record GetConversationSessionsQuery(
    int Page = 1,
    int PageSize = 20,
    bool? ActiveOnly = null
) : IRequest<ConversationSessionsResult>;

public record ConversationSessionsResult(
    IReadOnlyList<ConversationSessionDto> Items,
    int Total,
    int Page,
    int PageSize
);

public record ConversationSessionDto(
    Guid Id,
    string ExternalCustomerId,
    string Channel,
    string State,
    string? CollectedName,
    string? CollectedPhone,
    string? CollectedEmail,
    string? CollectedAddress,
    string CartJson,
    string MessagesJson,
    bool IsActive,
    int MessageCount,
    DateTime LastMessageAt,
    DateTime CreatedAt
);

public class GetConversationSessionsQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetConversationSessionsQuery, ConversationSessionsResult>
{
    public async Task<ConversationSessionsResult> Handle(GetConversationSessionsQuery request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var query = db.ConversationSessions
            .AsNoTracking()
            .Where(s => s.TenantId == tenantId);

        if (request.ActiveOnly.HasValue)
            query = query.Where(s => s.IsActive == request.ActiveOnly.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.LastMessageAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new ConversationSessionDto(
                s.Id,
                s.ExternalCustomerId,
                s.Channel,
                s.State.ToString(),
                s.CollectedName,
                s.CollectedPhone,
                s.CollectedEmail,
                s.CollectedAddress,
                s.CartJson,
                s.MessagesJson,
                s.IsActive,
                s.MessageCount,
                s.LastMessageAt,
                s.CreatedAt))
            .ToListAsync(ct);

        return new ConversationSessionsResult(items, total, request.Page, request.PageSize);
    }
}


