using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Chatbot;

/// <summary>
/// An order placed through an external chatbot client's widget / channel.
/// Stored so the SuperAdmin can see orders per client and so the widget can
/// show a confirmed order number to the customer.
/// </summary>
public class ChatbotOrder : BaseEntity
{
    public Guid    ClientId        { get; set; }
    public string  OrderNumber     { get; set; } = string.Empty;   // e.g. RC-260616-0042
    public string? SessionId       { get; set; }                   // widget session that placed it

    // ── Customer ──────────────────────────────────────────────────────────────
    public string? CustomerName    { get; set; }
    public string? CustomerPhone   { get; set; }
    public string? DeliveryAddress { get; set; }

    // ── Items + totals ────────────────────────────────────────────────────────
    public string  ItemsJson       { get; set; } = "[]";   // [{title, qty, unitPrice, variant}]
    public decimal Total           { get; set; }
    public string  Currency        { get; set; } = "INR";

    // ── Payment ───────────────────────────────────────────────────────────────
    public string  PaymentMethod   { get; set; } = "cod";       // cod | online
    public string  PaymentStatus   { get; set; } = "pending";   // pending | paid | failed
    public string  OrderStatus     { get; set; } = "placed";    // placed | confirmed | cancelled | fulfilled

    // ── Razorpay (online payments) ────────────────────────────────────────────
    public string? RazorpayOrderId   { get; set; }
    public string? RazorpayPaymentId { get; set; }

    public ChatbotClient Client { get; set; } = null!;
}
