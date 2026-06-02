using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Chatbot;

public class ChatbotProduct : BaseEntity
{
    public Guid    ClientId    { get; set; }
    public string  Title       { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price       { get; set; }
    public decimal? SalePrice  { get; set; }
    public string? Variants    { get; set; }  // JSON: ["Small","Medium","Large"]
    public string? ImageUrl    { get; set; }
    public string? Category    { get; set; }
    public bool    IsAvailable { get; set; } = true;

    public ChatbotClient Client { get; set; } = null!;
}
