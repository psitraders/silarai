using Ganss.Xss;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// Allow-list sanitiser (Ganss.Xss / HtmlSanitizer) for merchant rich text.
/// Keeps formatting tags, links and images; strips scripts, iframes, forms,
/// event handlers, inline styles and non-http(s)/mailto/tel URLs.
/// Thread-safe after configuration, so registered as a singleton.
/// </summary>
public sealed class HtmlSanitizerService : IHtmlSanitizerService
{
    private readonly HtmlSanitizer _sanitizer;

    public HtmlSanitizerService()
    {
        _sanitizer = new HtmlSanitizer();
        _sanitizer.AllowedSchemes.Clear();
        foreach (var scheme in new[] { "http", "https", "mailto", "tel" })
            _sanitizer.AllowedSchemes.Add(scheme);

        // Styling comes from the storefront theme, never from merchant HTML.
        _sanitizer.AllowedAttributes.Remove("style");
        _sanitizer.AllowedTags.Remove("style");
        _sanitizer.AllowedAtRules.Clear();
        _sanitizer.AllowedCssProperties.Clear();

        _sanitizer.AllowedAttributes.Add("target");
        _sanitizer.AllowedAttributes.Add("rel");
        _sanitizer.PostProcessNode += (_, e) =>
        {
            // Links opening a new tab must not leak window.opener.
            if (e.Node is AngleSharp.Dom.IElement el && el.TagName.Equals("A", StringComparison.OrdinalIgnoreCase)
                && el.GetAttribute("target") is { } target && target.Equals("_blank", StringComparison.OrdinalIgnoreCase))
                el.SetAttribute("rel", "noopener noreferrer");
        };
    }

    public string Sanitize(string html) => string.IsNullOrWhiteSpace(html) ? string.Empty : _sanitizer.Sanitize(html);
}
