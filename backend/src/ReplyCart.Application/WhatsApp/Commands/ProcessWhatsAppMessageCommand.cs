using MediatR;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Conversation.Commands;

namespace ReplyCart.Application.WhatsApp.Commands;

public record ProcessWhatsAppMessageCommand(
    string FromPhone,
    string SenderName,
    string MessageText,
    string WhatsAppMessageId,
    Guid TenantId
) : IRequest<Guid>;

public class ProcessWhatsAppMessageHandler(IMediator mediator)
    : IRequestHandler<ProcessWhatsAppMessageCommand, Guid>
{
    public async Task<Guid> Handle(ProcessWhatsAppMessageCommand request, CancellationToken ct)
    {
        var result = await mediator.Send(new HandleInboundMessageCommand(
            TenantId:         request.TenantId,
            Channel:          "WhatsApp",
            ExternalSenderId: request.FromPhone,
            SenderName:       request.SenderName,
            MessageText:      request.MessageText,
            MessageId:        request.WhatsAppMessageId
        ), ct);

        return result.LeadId;
    }
}
