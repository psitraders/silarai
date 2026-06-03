using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record SendOtpCommand(string Phone) : IRequest;

public class SendOtpCommandHandler(IAppDbContext db, IOtpService otpService)
    : IRequestHandler<SendOtpCommand>
{
    public async Task Handle(SendOtpCommand request, CancellationToken cancellationToken)
    {
        var phone = new string(request.Phone.Where(char.IsDigit).ToArray());

        if (phone.Length < 10)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Phone", "Enter a valid 10-digit mobile number.")]);

        // Check a user with this phone exists and is active
        var userExists = await db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Phone == phone && u.IsActive, cancellationToken);

        if (!userExists)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Phone", "No account found with this mobile number.")]);

        var sent = await otpService.SendOtpAsync(phone, cancellationToken);
        if (!sent)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Phone", "Could not send OTP. Please try again or contact support.")]);
    }
}


