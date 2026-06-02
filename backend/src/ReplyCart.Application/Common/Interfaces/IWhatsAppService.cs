namespace ReplyCart.Application.Common.Interfaces;

public interface IWhatsAppService
{
    bool IsConfigured { get; }
    Task SendTextMessageAsync(string toPhone, string message, CancellationToken ct = default);
    Task SendTemplateMessageAsync(string toPhone, string templateName, string languageCode, CancellationToken ct = default);
    Task<Guid?> ResolveTenantByPhoneNumberIdAsync(string phoneNumberId, CancellationToken ct = default);
}
