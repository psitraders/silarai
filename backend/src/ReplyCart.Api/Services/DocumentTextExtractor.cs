using System.IO.Compression;
using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace ReplyCart.Api.Services;

/// <summary>
/// Extracts plain text from uploaded knowledge-base files.
///   • .txt / .md / .csv  → read directly
///   • .docx              → OpenXML (reliable)
///   • .pdf               → best-effort FlateDecode extraction (no external deps)
/// PDF extraction handles most text-based PDFs; scanned/image PDFs won't yield text,
/// which the caller detects via <see cref="LooksReadable"/>.
/// </summary>
public static class DocumentTextExtractor
{
    private const int MaxChars = 200_000;

    public static string Extract(Stream stream, string fileName, string contentType)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();

        string text = ext switch
        {
            ".docx" => ExtractDocx(stream),
            ".pdf"  => ExtractPdf(ReadAll(stream)),
            ".txt" or ".md" or ".markdown" or ".csv" or ".text" or "" => ReadText(stream),
            _ => throw new NotSupportedException($"Unsupported file type '{ext}'. Upload PDF, Word (.docx), or text (.txt/.md).")
        };

        text = Normalize(text);
        return text.Length > MaxChars ? text[..MaxChars] : text;
    }

    /// <summary>Heuristic: enough text, and mostly printable (catches scanned/garbled PDFs).</summary>
    public static bool LooksReadable(string text)
    {
        if (string.IsNullOrWhiteSpace(text) || text.Length < 20) return false;
        int printable = text.Count(c => c >= ' ' && c < 127 || c == '\n' || c == '\t' || c > 160);
        return (double)printable / text.Length >= 0.80;
    }

    // ── Plain text ────────────────────────────────────────────────────────────
    private static string ReadText(Stream s)
    {
        using var r = new StreamReader(s, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
        return r.ReadToEnd();
    }

    // ── DOCX ──────────────────────────────────────────────────────────────────
    private static string ExtractDocx(Stream s)
    {
        using var doc = WordprocessingDocument.Open(s, false);
        var body = doc.MainDocumentPart?.Document?.Body;
        if (body == null) return string.Empty;
        var paras = body.Descendants<Paragraph>().Select(p => p.InnerText);
        return string.Join("\n", paras);
    }

    // ── PDF (best effort) ──────────────────────────────────────────────────────
    private static byte[] ReadAll(Stream s)
    {
        using var ms = new MemoryStream();
        s.CopyTo(ms);
        return ms.ToArray();
    }

    private static string ExtractPdf(byte[] bytes)
    {
        // Latin1 keeps a 1:1 byte↔char mapping so string offsets equal byte offsets.
        var content = Encoding.Latin1.GetString(bytes);
        var sb = new StringBuilder();
        int idx = 0;
        while (true)
        {
            int s = content.IndexOf("stream", idx, StringComparison.Ordinal);
            if (s < 0) break;
            int dataStart = s + 6;
            if (dataStart < content.Length && content[dataStart] == '\r') dataStart++;
            if (dataStart < content.Length && content[dataStart] == '\n') dataStart++;
            int e = content.IndexOf("endstream", dataStart, StringComparison.Ordinal);
            if (e < 0) break;

            int len = e - dataStart;
            if (len > 0)
            {
                var streamBytes = new byte[len];
                Array.Copy(bytes, dataStart, streamBytes, 0, len);
                var decoded = TryInflate(streamBytes) ?? Encoding.Latin1.GetString(streamBytes);
                AppendPdfStrings(decoded, sb);
            }
            idx = e + 9;
        }
        return sb.ToString();
    }

    private static string? TryInflate(byte[] data)
    {
        // zlib stream → 0x78 header
        if (data.Length < 3 || data[0] != 0x78) return null;
        try
        {
            using var ms = new MemoryStream(data);
            using var zs = new ZLibStream(ms, CompressionMode.Decompress);
            using var outMs = new MemoryStream();
            zs.CopyTo(outMs);
            return Encoding.Latin1.GetString(outMs.ToArray());
        }
        catch { return null; }
    }

    /// <summary>Pull visible text from PDF content-stream string literals: ( ... ) Tj / [ ... ] TJ.</summary>
    private static void AppendPdfStrings(string content, StringBuilder sb)
    {
        int i = 0;
        while (i < content.Length)
        {
            if (content[i] != '(') { i++; continue; }
            i++; // past '('
            int depth = 1;
            while (i < content.Length && depth > 0)
            {
                char ch = content[i];
                if (ch == '\\' && i + 1 < content.Length)
                {
                    char n = content[i + 1];
                    switch (n)
                    {
                        case 'n': sb.Append('\n'); i += 2; continue;
                        case 'r': sb.Append('\r'); i += 2; continue;
                        case 't': sb.Append('\t'); i += 2; continue;
                        case '(': sb.Append('('); i += 2; continue;
                        case ')': sb.Append(')'); i += 2; continue;
                        case '\\': sb.Append('\\'); i += 2; continue;
                        default:
                            if (n >= '0' && n <= '7')
                            {
                                int j = i + 1, oct = 0, cnt = 0;
                                while (j < content.Length && cnt < 3 && content[j] >= '0' && content[j] <= '7')
                                { oct = oct * 8 + (content[j] - '0'); j++; cnt++; }
                                if (oct >= 32) sb.Append((char)oct);
                                i = j; continue;
                            }
                            sb.Append(n); i += 2; continue;
                    }
                }
                if (ch == '(') { depth++; sb.Append(ch); i++; continue; }
                if (ch == ')') { depth--; i++; if (depth == 0) break; sb.Append(ch); continue; }
                sb.Append(ch); i++;
            }
            sb.Append(' ');
        }
    }

    // ── Cleanup ────────────────────────────────────────────────────────────────
    private static string Normalize(string text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        var sb = new StringBuilder(text.Length);
        int blankRun = 0;
        foreach (var raw in text.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n'))
        {
            // collapse internal whitespace
            var line = string.Join(' ', raw.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).Trim();
            if (line.Length == 0) { if (++blankRun > 1) continue; }
            else blankRun = 0;
            sb.Append(line).Append('\n');
        }
        return sb.ToString().Trim();
    }
}
