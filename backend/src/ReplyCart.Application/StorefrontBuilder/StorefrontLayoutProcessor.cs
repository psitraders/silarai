using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.StorefrontBuilder;

/// <summary>Thrown when a builder document fails validation. <see cref="Errors"/> are path-prefixed and safe to show.</summary>
public sealed class StorefrontLayoutValidationException(IReadOnlyList<string> errors)
    : Exception("The storefront document is not valid.")
{
    public IReadOnlyList<string> Errors { get; } = errors;
}

/// <summary>Where uploaded images may come from (Cloudinary + this API host's /uploads/).</summary>
public sealed record ImageSourceRules(string? ApiHost);

/// <summary>
/// Validates and cleans storefront builder documents before they are stored.
///
/// The backend is deliberately schema-agnostic (SB-R4): it checks only the
/// document envelope (sections / blocks shape, ids, sizes) and the four kinds of
/// "smart values" that may appear anywhere in settings:
///   { "$richtext": "&lt;p&gt;…" }   → sanitised HTML
///   { "$link": "…" }             → https / http / mailto / tel / internal path / #anchor only
///   { "$image": "…" }            → Cloudinary or this API's /uploads/ only
///   { "$products": {…} } / { "$categories": {…} } → shape-checked query (resolved on read)
/// New sections, layouts and templates therefore never need backend changes.
/// </summary>
public sealed class StorefrontLayoutProcessor(IHtmlSanitizerService sanitizer)
{
    public const int MaxPageBytes     = 300 * 1024;
    public const int MaxSiteBytes     = 150 * 1024;
    public const int MaxSections      = 60;
    public const int MaxBlocks        = 50;
    public const int MaxStringLength  = 10_000;
    public const int MaxRichTextLength = 60_000;
    public const int MaxProductLimit  = 24;
    public const int MaxCategoryLimit = 48;

    private static readonly Regex IdPattern   = new("^[A-Za-z0-9_-]{1,40}$", RegexOptions.Compiled);
    private static readonly Regex TypePattern = new("^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.Compiled);
    private static readonly HashSet<string> Schemes      = ["light", "soft", "contrast", "brand", "accent"];
    private static readonly HashSet<string> Visibilities = ["all", "desktop", "mobile"];
    private static readonly HashSet<string> ProductSources  = ["featured", "category", "manual", "newest", "sale", "all"];
    private static readonly HashSet<string> CategorySources = ["all", "featured", "manual"];

    private static readonly JsonDocumentOptions ParseOptions = new() { MaxDepth = 32, CommentHandling = JsonCommentHandling.Disallow };

    /// <summary>Validates + cleans a page layout: <c>{ schemaVersion, sections: [...] }</c>.</summary>
    public string PreparePageLayout(string json, ImageSourceRules rules)
    {
        var errors = new List<string>();
        var root = Parse(json, MaxPageBytes, errors);
        if (root is JsonObject doc)
        {
            ValidateSchemaVersion(doc, "", errors);
            if (doc["sections"] is not JsonArray sections)
                errors.Add("sections: must be an array.");
            else
                ValidateSectionList(sections, "sections", errors);
        }
        else if (root is not null)
            errors.Add("Document must be a JSON object.");

        if (root is not null && errors.Count == 0)
            ProcessSmartValues(root, "", rules, errors);

        if (errors.Count > 0) throw new StorefrontLayoutValidationException(errors);
        return root!.ToJsonString();
    }

    /// <summary>
    /// Validates + cleans the site document (theme, behaviour, header, footer, menus).
    /// Header and footer are validated like sections; everything else is free-form
    /// data for the frontend (still subject to smart-value and size rules).
    /// </summary>
    public string PrepareSiteDocument(string json, ImageSourceRules rules)
    {
        var errors = new List<string>();
        var root = Parse(json, MaxSiteBytes, errors);
        if (root is JsonObject doc)
        {
            ValidateSchemaVersion(doc, "", errors);
            var ids = new HashSet<string>();
            foreach (var key in new[] { "header", "footer" })
            {
                if (doc[key] is null) continue;
                if (doc[key] is JsonObject section) ValidateSection(section, key, ids, errors);
                else errors.Add($"{key}: must be an object.");
            }
            if (doc["templateId"] is JsonNode t && !(t is JsonValue tv && tv.TryGetValue<string>(out var tid) && TypePattern.IsMatch(tid)))
                errors.Add("templateId: must be a lowercase id.");
        }
        else if (root is not null)
            errors.Add("Document must be a JSON object.");

        if (root is not null && errors.Count == 0)
            ProcessSmartValues(root, "", rules, errors);

        if (errors.Count > 0) throw new StorefrontLayoutValidationException(errors);
        return root!.ToJsonString();
    }

    // ── Envelope ──────────────────────────────────────────────────────────────

    private static JsonNode? Parse(string json, int maxBytes, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(json)) { errors.Add("Document is empty."); return null; }
        if (Encoding.UTF8.GetByteCount(json) > maxBytes)
        {
            errors.Add($"Document is too large (max {maxBytes / 1024} KB).");
            return null;
        }
        try { return JsonNode.Parse(json, documentOptions: ParseOptions); }
        catch (JsonException) { errors.Add("Document is not valid JSON."); return null; }
    }

    private static void ValidateSchemaVersion(JsonObject doc, string path, List<string> errors)
    {
        if (doc["schemaVersion"] is not JsonValue v || !v.TryGetValue<int>(out var ver) || ver < 1)
            errors.Add($"{Prefix(path)}schemaVersion: must be a positive integer.");
    }

    private static void ValidateSectionList(JsonArray sections, string path, List<string> errors)
    {
        if (sections.Count > MaxSections)
            errors.Add($"{path}: at most {MaxSections} sections per page.");
        var ids = new HashSet<string>();
        for (var i = 0; i < sections.Count; i++)
        {
            var p = $"{path}[{i}]";
            if (sections[i] is JsonObject s) ValidateSection(s, p, ids, errors);
            else errors.Add($"{p}: must be an object.");
        }
    }

    private static void ValidateSection(JsonObject s, string path, HashSet<string> ids, List<string> errors)
    {
        ValidateId(s, path, ids, errors);
        ValidateType(s, "type", path, errors, required: true);
        ValidateType(s, "layout", path, errors, required: false);
        ValidateEnum(s, "scheme", Schemes, path, errors);
        ValidateEnum(s, "visibility", Visibilities, path, errors);
        if (s["settings"] is not null and not JsonObject)
            errors.Add($"{path}.settings: must be an object.");

        if (s["blocks"] is null) return;
        if (s["blocks"] is not JsonArray blocks) { errors.Add($"{path}.blocks: must be an array."); return; }
        if (blocks.Count > MaxBlocks) errors.Add($"{path}.blocks: at most {MaxBlocks} blocks.");
        var blockIds = new HashSet<string>();
        for (var i = 0; i < blocks.Count; i++)
        {
            var bp = $"{path}.blocks[{i}]";
            if (blocks[i] is not JsonObject b) { errors.Add($"{bp}: must be an object."); continue; }
            ValidateId(b, bp, blockIds, errors);
            ValidateType(b, "type", bp, errors, required: true);
            ValidateEnum(b, "scheme", Schemes, bp, errors);
            if (b["settings"] is not null and not JsonObject)
                errors.Add($"{bp}.settings: must be an object.");
        }
    }

    private static void ValidateId(JsonObject o, string path, HashSet<string> seen, List<string> errors)
    {
        if (o["id"] is not JsonValue v || !v.TryGetValue<string>(out var id) || !IdPattern.IsMatch(id))
            errors.Add($"{path}.id: required, 1–40 letters, digits, '-' or '_'.");
        else if (!seen.Add(id))
            errors.Add($"{path}.id: '{id}' is used twice.");
    }

    private static void ValidateType(JsonObject o, string key, string path, List<string> errors, bool required)
    {
        var node = o[key];
        if (node is null) { if (required) errors.Add($"{path}.{key}: required."); return; }
        if (node is not JsonValue v || !v.TryGetValue<string>(out var value) || value.Length > 60 || !TypePattern.IsMatch(value))
            errors.Add($"{path}.{key}: must be a lowercase id like 'product-collection'.");
    }

    private static void ValidateEnum(JsonObject o, string key, HashSet<string> allowed, string path, List<string> errors)
    {
        var node = o[key];
        if (node is null) return;
        if (node is not JsonValue v || !v.TryGetValue<string>(out var value) || !allowed.Contains(value))
            errors.Add($"{path}.{key}: must be one of {string.Join(", ", allowed)}.");
    }

    // ── Smart values ──────────────────────────────────────────────────────────

    private void ProcessSmartValues(JsonNode node, string path, ImageSourceRules rules, List<string> errors)
    {
        switch (node)
        {
            case JsonObject obj:
            {
                var smartKey = obj.Select(kv => kv.Key).FirstOrDefault(k => k.StartsWith('$'));
                if (smartKey is not null)
                {
                    if (obj.Count != 1)
                    {
                        errors.Add($"{path}: a '{smartKey}' value must be the only property of its object.");
                        return;
                    }
                    ProcessSmartValue(obj, smartKey, path, rules, errors);
                    return;
                }
                foreach (var key in obj.Select(kv => kv.Key).ToList())
                {
                    if (key.Length > 80) { errors.Add($"{path}: property name too long."); continue; }
                    var child = obj[key];
                    if (child is not null) ProcessSmartValues(child, Join(path, key), rules, errors);
                }
                break;
            }
            case JsonArray arr:
                for (var i = 0; i < arr.Count; i++)
                    if (arr[i] is { } child) ProcessSmartValues(child, $"{path}[{i}]", rules, errors);
                break;
            case JsonValue val when val.TryGetValue<string>(out var s) && s.Length > MaxStringLength:
                errors.Add($"{path}: text is too long (max {MaxStringLength} characters).");
                break;
        }
    }

    private void ProcessSmartValue(JsonObject obj, string key, string path, ImageSourceRules rules, List<string> errors)
    {
        var p = Join(path, key);
        switch (key)
        {
            case "$richtext":
                if (!TryString(obj[key], out var html) || html.Length > MaxRichTextLength)
                { errors.Add($"{p}: must be text up to {MaxRichTextLength} characters."); return; }
                obj[key] = sanitizer.Sanitize(html);
                return;

            case "$link":
                if (!TryString(obj[key], out var link) || link.Length > 2000 || !IsAllowedLink(link.Trim()))
                { errors.Add($"{p}: links must start with https://, http://, mailto:, tel:, / or #."); return; }
                obj[key] = link.Trim();
                return;

            case "$image":
                if (!TryString(obj[key], out var img) || img.Length > 2000)
                { errors.Add($"{p}: must be an image URL."); return; }
                if (img.Length > 0 && !IsAllowedImage(img.Trim(), rules))
                { errors.Add($"{p}: images must be uploaded to this store."); return; }
                obj[key] = img.Trim();
                return;

            case "$products":
                ValidateProductQuery(obj[key], p, errors);
                return;

            case "$categories":
                ValidateCategoryQuery(obj[key], p, errors);
                return;

            default:
                errors.Add($"{p}: unknown smart value.");
                return;
        }
    }

    private static void ValidateProductQuery(JsonNode? node, string path, List<string> errors)
    {
        if (node is not JsonObject q) { errors.Add($"{path}: must be an object."); return; }
        foreach (var k in q.Select(kv => kv.Key))
            if (k is not ("source" or "categoryId" or "productIds" or "limit"))
                errors.Add($"{path}.{k}: not allowed.");

        if (!TryString(q["source"], out var source) || !ProductSources.Contains(source))
        { errors.Add($"{path}.source: must be one of {string.Join(", ", ProductSources)}."); return; }
        if (source == "category" && !TryGuid(q["categoryId"], out _))
            errors.Add($"{path}.categoryId: required when source is 'category'.");
        if (source == "manual") ValidateGuidList(q["productIds"], MaxProductLimit, $"{path}.productIds", errors, required: true);
        ValidateLimit(q["limit"], MaxProductLimit, $"{path}.limit", errors);
    }

    private static void ValidateCategoryQuery(JsonNode? node, string path, List<string> errors)
    {
        if (node is not JsonObject q) { errors.Add($"{path}: must be an object."); return; }
        foreach (var k in q.Select(kv => kv.Key))
            if (k is not ("source" or "categoryIds" or "limit"))
                errors.Add($"{path}.{k}: not allowed.");

        if (!TryString(q["source"], out var source) || !CategorySources.Contains(source))
        { errors.Add($"{path}.source: must be one of {string.Join(", ", CategorySources)}."); return; }
        if (source == "manual") ValidateGuidList(q["categoryIds"], MaxCategoryLimit, $"{path}.categoryIds", errors, required: true);
        ValidateLimit(q["limit"], MaxCategoryLimit, $"{path}.limit", errors);
    }

    private static void ValidateGuidList(JsonNode? node, int max, string path, List<string> errors, bool required)
    {
        if (node is null) { if (required) errors.Add($"{path}: required."); return; }
        if (node is not JsonArray arr || arr.Count > max || arr.Any(n => !TryGuid(n, out _)))
            errors.Add($"{path}: must be a list of up to {max} ids.");
    }

    private static void ValidateLimit(JsonNode? node, int max, string path, List<string> errors)
    {
        if (node is null) return;
        if (node is not JsonValue v || !v.TryGetValue<int>(out var n) || n < 1 || n > max)
            errors.Add($"{path}: must be between 1 and {max}.");
    }

    internal static bool IsAllowedLink(string link)
    {
        if (link.Length == 0) return true; // empty = no link
        if (link.StartsWith('#')) return true;
        if (link.StartsWith('/') && !link.StartsWith("//")) return true;
        if (link.StartsWith("mailto:", StringComparison.OrdinalIgnoreCase)) return true;
        if (link.StartsWith("tel:", StringComparison.OrdinalIgnoreCase)) return true;
        return Uri.TryCreate(link, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp);
    }

    public static bool IsAllowedImage(string url, ImageSourceRules rules)
    {
        if (url.StartsWith("/uploads/", StringComparison.Ordinal)) return true;
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return false;
        if (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp) return false;
        if (uri.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase)) return true;
        return rules.ApiHost is not null
            && uri.Authority.Equals(rules.ApiHost, StringComparison.OrdinalIgnoreCase)
            && uri.AbsolutePath.StartsWith("/uploads/", StringComparison.Ordinal);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static bool TryString(JsonNode? node, out string value)
    {
        if (node is JsonValue v && v.TryGetValue<string>(out var s) && s is not null)
        {
            value = s;
            return true;
        }
        value = string.Empty;
        return false;
    }

    private static bool TryGuid(JsonNode? node, out Guid id)
    {
        id = Guid.Empty;
        return TryString(node, out var s) && Guid.TryParse(s, out id);
    }

    private static string Join(string path, string key) => path.Length == 0 ? key : $"{path}.{key}";
    private static string Prefix(string path) => path.Length == 0 ? string.Empty : path + ".";
}
