using MediatR;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record DisableTotpCommand(Guid UserId, string Password) : IRequest;

public class DisableTotpCommandHandler(IAppDbContext db)
    : IRequestHandler<DisableTotpCommand>
{
    public async Task Handle(DisableTotpCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FindAsync([request.UserId], cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Password", "Password is incorrect.")]);

        user.IsTwoFactorEnabled = false;
        user.TotpSecret = null;
        await db.SaveChangesAsync(cancellationToken);
    }
}


