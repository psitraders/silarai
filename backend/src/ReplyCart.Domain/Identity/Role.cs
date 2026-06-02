using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Identity;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<UserRole> UserRoles { get; set; } = [];
}
