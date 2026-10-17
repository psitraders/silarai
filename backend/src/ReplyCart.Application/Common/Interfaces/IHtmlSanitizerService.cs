namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Allow-list HTML sanitiser for merchant-authored rich text (storefront builder
/// <c>$richtext</c> values and legacy custom-page HTML). Removes scripts, event
/// handlers, unsafe URLs and any tag/attribute not on the allow-list.
/// </summary>
public interface IHtmlSanitizerService
{
    string Sanitize(string html);
}
