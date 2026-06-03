namespace ReplyCart.Application.Common.Exceptions;

/// <summary>
/// Thrown when an order requests more units than are available in stock.
/// Maps to HTTP 422 Unprocessable Entity so the client can surface the message directly.
/// </summary>
public class InsufficientStockException(string productTitle, int available, int requested)
    : Exception($"Cannot place order. Only {available} unit{(available == 1 ? "" : "s")} of \"{productTitle}\" available in stock (requested {requested}).")
{
    public string ProductTitle { get; } = productTitle;
    public int Available { get; } = available;
    public int Requested { get; } = requested;
}


