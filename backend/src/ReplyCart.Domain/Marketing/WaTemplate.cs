using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Marketing;

/// <summary>
/// A WhatsApp message template stored per-tenant.
/// The <see cref="Name"/> maps 1:1 to an AiSensy campaign name.
/// </summary>
public class WaTemplate : TenantEntity
{
    /// <summary>AiSensy campaign name (must match exactly in AiSensy dashboard).</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Display label shown in the ReplyCart UI.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>MARKETING | UTILITY | AUTHENTICATION | TRANSACTIONAL</summary>
    public string Category { get; set; } = "MARKETING";

    /// <summary>BCP-47 language code, e.g. "en", "hi", "ar".</summary>
    public string Language { get; set; } = "en";

    /// <summary>
    /// Template body text.  Variables use {{1}}, {{2}} … placeholders.
    /// </summary>
    public string Body { get; set; } = string.Empty;

    /// <summary>Optional header text (plain text or image URL).</summary>
    public string? HeaderText { get; set; }

    /// <summary>Optional footer text.</summary>
    public string? FooterText { get; set; }

    /// <summary>
    /// JSON array describing each variable, e.g.
    /// [{"index":1,"label":"Customer name"},{"index":2,"label":"Order ID"}]
    /// </summary>
    public string? VariablesJson { get; set; }

    /// <summary>When false the template is hidden from the send UI.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>True for the built-in seed templates shipped with ReplyCart.</summary>
    public bool IsDefault { get; set; }

    // ── Meta Cloud API ─────────────────────────────────────────────────────────

    /// <summary>Template ID returned by Meta after submission.</summary>
    public string? MetaTemplateId { get; set; }

    /// <summary>
    /// Approval status from Meta: LOCAL | PENDING | APPROVED | REJECTED | PAUSED | DISABLED.
    /// LOCAL = saved locally but not yet submitted to Meta.
    /// </summary>
    public string MetaStatus { get; set; } = "LOCAL";
}
