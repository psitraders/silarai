using MediatR;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record UpdateProfileCommand(Guid UserId, string Name, string? Phone, string? AvatarUrl) : IRequest;

public class UpdateProfileCommandHandler(IAppDbContext db)
    : IRequestHandler<UpdateProfileCommand>
{
    public async Task Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FindAsync([request.UserId], cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Name", "Name is required.")]);

        user.Name = request.Name.Trim();
        user.Phone = request.Phone?.Trim();
        user.AvatarUrl = request.AvatarUrl?.Trim();

        await db.SaveChangesAsync(cancellationToken);
    }
}
