namespace ReplyCart.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(Guid userId, Guid tenantId, string email, IEnumerable<string> roles);
    string GenerateRefreshToken();
    string HashToken(string token);
    bool ValidateRefreshToken(string token, string hash);
}
