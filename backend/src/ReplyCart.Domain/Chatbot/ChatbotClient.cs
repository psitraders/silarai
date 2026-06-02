using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Chatbot;

public class ChatbotClient : BaseEntity
{
    // ── Core ──────────────────────────────────────────────────────────────────
    public string  Name            { get; set; } = string.Empty;
    public string  BusinessDesc    { get; set; } = string.Empty;
    public string  ApiKey          { get; set; } = string.Empty;   // rc_bot_xxxx
    public string  Currency        { get; set; } = "INR";
    public string  Language        { get; set; } = "en";
    public string? WebhookUrl      { get; set; }   // POST orders here
    public string? ContactEmail    { get; set; }
    public string? ContactPhone    { get; set; }
    public string? LogoUrl         { get; set; }
    public string? WelcomeMessage  { get; set; }
    public bool    IsActive        { get; set; } = true;

    // ── WhatsApp Business Cloud API ───────────────────────────────────────────
    public string? WaPhoneNumberId  { get; set; }   // Meta Phone Number ID
    public string? WaAccessToken    { get; set; }   // Permanent system user token
    public string? WaPhoneNumber    { get; set; }   // Display number e.g. +919876543210
    public string? WaBusinessId     { get; set; }   // WABA ID

    // ── Facebook Messenger ────────────────────────────────────────────────────
    public string? FbPageId          { get; set; }
    public string? FbPageAccessToken { get; set; }

    // ── Instagram Messaging ───────────────────────────────────────────────────
    public string? IgAccountId       { get; set; }
    public string? IgAccessToken     { get; set; }

    // ── Shopify Catalog Sync ──────────────────────────────────────────────────
    public string? ShopifyDomain     { get; set; }   // e.g. mystore.myshopify.com
    public string? ShopifyApiKey     { get; set; }   // Admin API access token
    public DateTime? LastShopifySync { get; set; }

    public ICollection<ChatbotProduct> Products { get; set; } = [];
}
