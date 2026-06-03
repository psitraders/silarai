using MediatR;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Helpers;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

/// <summary>Enable 2FA after setup — user must provide a valid TOTP code to confirm.</summary>
public record VerifyTotpCommand(Guid UserId, string Code) : IRequest;

public class VerifyTotpCommandHandler(IAppDbContext db)
    : IRequestHandler<VerifyTotpCommand>
{
    public async Task Handle(VerifyTotpCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FindAsync([request.UserId], cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        if (string.IsNullOrWhiteSpace(user.TotpSecret))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Code", "2FA setup not initiated. Call /auth/totp/setup first.")]);

        if (!TotpHelper.Verify(user.TotpSecret, request.Code))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Code", "Invalid authentication code. Please try again.")]);

        user.IsTwoFactorEnabled = true;
        await db.SaveChangesAsync(cancellationToken);
    }
}


