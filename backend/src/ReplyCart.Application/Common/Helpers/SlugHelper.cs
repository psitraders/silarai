using System.Text.RegularExpressions;

namespace ReplyCart.Application.Common.Helpers;

public static class SlugHelper
{
    /// <summary>
    /// Converts a product title to a URL-friendly slug.
    /// "Rose Bouquet (Large)" → "rose-bouquet-large"
    /// </summary>
    public static string Generate(string title)
    {
        var slug = title.ToLowerInvariant();

        // Remove everything that isn't a letter, digit, space, or hyphen
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", " ");

        // Collapse whitespace/hyphens into a single hyphen
        slug = Regex.Replace(slug, @"[\s-]+", "-");

        // Trim leading/trailing hyphens and cap length
        slug = slug.Trim('-');

        return slug.Length > 100 ? slug[..100].TrimEnd('-') : slug;
    }

    /// <summary>
    /// Returns a unique slug within a tenant by appending -2, -3, … when the base slug already exists.
    /// </summary>
    public static async Task<string> GenerateUniqueAsync(
        string title,
        Guid tenantId,
        Func<string, Task<bool>> existsAsync,
        Guid? excludeId = null)
    {
        var baseSlug = Generate(title);
        if (string.IsNullOrEmpty(baseSlug)) baseSlug = "product";

        var slug = baseSlug;
        var counter = 2;

        while (await existsAsync(slug))
        {
            slug = $"{baseSlug}-{counter++}";
            if (counter > 999) break; // safety valve
        }

        return slug;
    }
}


