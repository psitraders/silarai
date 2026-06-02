using MediatR;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Helpers;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record SetupTotpCommand(Guid UserId) : IRequest<SetupTotpResult>;
public record SetupTotpResult(string Secret, string OtpAuthUri);

public class SetupTotpCommandHandler(IAppDbContext db)
    : IRequestHandler<SetupTotpCommand, SetupTotpResult>
{
    public async Task<SetupTotpResult> Handle(SetupTotpCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FindAsync([request.UserId], cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        var secret = TotpHelper.GenerateSecret();
        user.TotpSecret = secret;
        // 2FA is NOT enabled yet — user must verify the code first
        user.IsTwoFactorEnabled = false;

        await db.SaveChangesAsync(cancellationToken);

        return new SetupTotpResult(
            secret,
            TotpHelper.GetOtpAuthUri(secret, user.Email)
        );
    }
}
