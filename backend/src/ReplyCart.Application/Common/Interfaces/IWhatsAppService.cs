namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// WhatsApp Business Cloud API (graph.facebook.com) — per-tenant credentials.
/// Each merchant connects their own WhatsApp Business number via Meta Embedded Signup.
/// </summary>
public interface IWhatsAppService
{
    /// <summary>True when PhoneNumberId + AccessToken are saved for the current tenant.</summary>
    bool IsConfigured { get; }

    /// <summary>Send a plain text message within the 24-hour customer-initiated window.</summary>
    Task SendTextMessageAsync(string toPhone, string message, CancellationToken ct = default);

    /// <summary>
    /// Send an approved Meta template (HSM) message.
    /// <para><paramref name="templateName"/> must be approved in Meta Business Manager.</para>
    /// <para><paramref name="languageCode"/> e.g. "en_US", "en".</para>
    /// <para><paramref name="bodyParams"/> are the {{1}}, {{2}} … variable values for the body component.</para>
    /// </summary>
    Task SendTemplateMessageAsync(
        string toPhone,
        string templateName,
        string languageCode,
        IEnumerable<string>? bodyParams = null,
        CancellationToken ct = default);

    /// <summary>Broadcast a plain text to many phone numbers. Returns sent count.</summary>
    Task<int> BroadcastTextMessageAsync(
        IEnumerable<string?> phones,
        string message,
        CancellationToken ct = default);

    /// <summary>Broadcast an approved template to many recipients. Returns sent count.</summary>
    Task<int> BroadcastCampaignAsync(
        IEnumerable<(string Phone, string Name)> recipients,
        string templateName,
        string languageCode = "en_US",
        IEnumerable<string>? bodyParams = null,
        CancellationToken ct = default);

    /// <summary>
    /// Resolve which tenant owns the given Meta Phone Number ID.
    /// Used by the webhook controller to route incoming messages to the right tenant.
    /// </summary>
    Task<Guid?> ResolveTenantByPhoneNumberIdAsync(string phoneNumberId, CancellationToken ct = default);
}
