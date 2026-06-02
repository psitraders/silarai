using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

public class CloudflareService(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    ILogger<CloudflareService> logger) : ICloudflareService
{
    private readonly string _zoneId    = config["Cloudflare:ZoneId"]    ?? throw new InvalidOperationException("Cloudflare:ZoneId not configured");
    private readonly string _token     = config["Cloudflare:ApiToken"]  ?? throw new InvalidOperationException("Cloudflare:ApiToken not configured");
    private readonly string _accountId = config["Cloudflare:AccountId"] ?? throw new InvalidOperationException("Cloudflare:AccountId not configured");

    private static readonly JsonSerializerOptions _json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private HttpClient CreateClient()
    {
        var client = httpClientFactory.CreateClient("Cloudflare");
        client.BaseAddress = new Uri("https://api.cloudflare.com/client/v4/");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return client;
    }

    public async Task<CloudflareHostnameResult> CreateCustomHostnameAsync(string domain, CancellationToken ct = default)
    {
        var client = CreateClient();
        var body = new
        {
            hostname = domain,
            ssl = new
            {
                method = "http",
                type = "dv",
                settings = new { min_tls_version = "1.0" }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"zones/{_zoneId}/custom_hostnames", content, ct);
        var raw = await response.Content.ReadAsStringAsync(ct);

        logger.LogInformation("[Cloudflare] CreateCustomHostname {Domain}: {StatusCode} {Body}", domain, response.StatusCode, raw);

        // 1406 = duplicate — hostname already exists in Cloudflare (e.g. previous disconnect
        // cleared our DB record but Cloudflare delete silently failed). Find and reuse it.
        if (!response.IsSuccessStatusCode)
        {
            if (raw.Contains("\"code\":1406") || raw.Contains("\"code\": 1406"))
            {
                logger.LogWarning("[Cloudflare] Duplicate hostname {Domain} — fetching existing record", domain);
                var existing = await FindExistingHostnameAsync(domain, ct);
                if (existing != null) return existing;
            }
            throw new InvalidOperationException($"Cloudflare API error: {raw}");
        }

        return ParseResult(raw);
    }

    private async Task<CloudflareHostnameResult?> FindExistingHostnameAsync(string domain, CancellationToken ct)
    {
        var client = CreateClient();
        var response = await client.GetAsync($"zones/{_zoneId}/custom_hostnames?hostname={Uri.EscapeDataString(domain)}", ct);
        if (!response.IsSuccessStatusCode) return null;

        var raw = await response.Content.ReadAsStringAsync(ct);
        logger.LogInformation("[Cloudflare] FindExistingHostname {Domain}: {Body}", domain, raw);

        using var doc = JsonDocument.Parse(raw);
        var result = doc.RootElement.GetProperty("result");
        if (result.ValueKind != JsonValueKind.Array) return null;

        foreach (var item in result.EnumerateArray())
        {
            var h = item.TryGetProperty("hostname", out var hn) ? hn.GetString() : null;
            if (string.Equals(h, domain, StringComparison.OrdinalIgnoreCase))
                return ParseElement(item);
        }
        return null;
    }

    public async Task<CloudflareHostnameResult?> GetHostnameStatusAsync(string hostnameId, CancellationToken ct = default)
    {
        var client = CreateClient();
        var response = await client.GetAsync($"zones/{_zoneId}/custom_hostnames/{hostnameId}", ct);
        if (!response.IsSuccessStatusCode) return null;

        var raw = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(raw);
        var result = doc.RootElement.GetProperty("result");
        return ParseElement(result);
    }

    public async Task DeleteCustomHostnameAsync(string hostnameId, CancellationToken ct = default)
    {
        var client = CreateClient();
        var response = await client.DeleteAsync($"zones/{_zoneId}/custom_hostnames/{hostnameId}", ct);
        logger.LogInformation("[Cloudflare] DeleteCustomHostname {Id}: {StatusCode}", hostnameId, response.StatusCode);
    }

    public async Task<string?> AddWorkerRouteAsync(string domain, CancellationToken ct = default)
    {
        var workerScript = config["Cloudflare:WorkerScript"] ?? "storefront-proxy";
        var client = CreateClient();
        var body = new { pattern = $"{domain}/*", script = workerScript };
        var content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"zones/{_zoneId}/workers/routes", content, ct);
        var raw = await response.Content.ReadAsStringAsync(ct);
        logger.LogInformation("[Cloudflare] AddWorkerRoute {Domain}: {StatusCode} {Body}", domain, response.StatusCode, raw);
        if (!response.IsSuccessStatusCode) return null;
        using var doc = JsonDocument.Parse(raw);
        return doc.RootElement.GetProperty("result").GetProperty("id").GetString();
    }

    public async Task DeleteWorkerRouteAsync(string routeId, CancellationToken ct = default)
    {
        var client = CreateClient();
        var response = await client.DeleteAsync($"zones/{_zoneId}/workers/routes/{routeId}", ct);
        logger.LogInformation("[Cloudflare] DeleteWorkerRoute {Id}: {StatusCode}", routeId, response.StatusCode);
    }

    // ── Zone management (apex domains) ───────────────────────────────────────

    public async Task<CloudflareZoneResult> CreateZoneAsync(string domain, CancellationToken ct = default)
    {
        var client = CreateClient();
        var body = new { name = domain, account = new { id = _accountId }, jump_start = false };
        var content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
        var response = await client.PostAsync("zones", content, ct);
        var raw = await response.Content.ReadAsStringAsync(ct);
        logger.LogInformation("[Cloudflare] CreateZone {Domain}: {StatusCode} {Body}", domain, response.StatusCode, raw);

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Cloudflare zone creation failed: {raw}");

        using var doc = JsonDocument.Parse(raw);
        var result = doc.RootElement.GetProperty("result");
        var id = result.GetProperty("id").GetString()!;
        var status = result.GetProperty("status").GetString() ?? "pending";
        var ns = result.GetProperty("name_servers").EnumerateArray()
                       .Select(n => n.GetString()!)
                       .ToArray();
        return new CloudflareZoneResult(id, ns, status);
    }

    public async Task<string> GetZoneStatusAsync(string zoneId, CancellationToken ct = default)
    {
        var client = CreateClient();
        var response = await client.GetAsync($"zones/{zoneId}", ct);
        if (!response.IsSuccessStatusCode) return "pending";
        var raw = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(raw);
        return doc.RootElement.GetProperty("result").GetProperty("status").GetString() ?? "pending";
    }

    public async Task AddApexCnameAsync(string zoneId, CancellationToken ct = default)
    {
        var client = CreateClient();
        var body = new { type = "CNAME", name = "@", content = "cname.replycart.app", proxied = true, ttl = 1 };
        var content = new StringContent(JsonSerializer.Serialize(body, _json), Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"zones/{zoneId}/dns_records", content, ct);
        var raw = await response.Content.ReadAsStringAsync(ct);
        logger.LogInformation("[Cloudflare] AddApexCname zone={ZoneId}: {StatusCode} {Body}", zoneId, response.StatusCode, raw);
    }

    public async Task DeleteZoneAsync(string zoneId, CancellationToken ct = default)
    {
        var client = CreateClient();
        var response = await client.DeleteAsync($"zones/{zoneId}", ct);
        logger.LogInformation("[Cloudflare] DeleteZone {ZoneId}: {StatusCode}", zoneId, response.StatusCode);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static CloudflareHostnameResult ParseResult(string raw)
    {
        using var doc = JsonDocument.Parse(raw);
        var result = doc.RootElement.GetProperty("result");
        return ParseElement(result);
    }

    private static CloudflareHostnameResult ParseElement(JsonElement result)
    {
        var id       = result.GetProperty("id").GetString() ?? "";
        var hostname = result.GetProperty("hostname").GetString() ?? "";
        var status   = result.TryGetProperty("status", out var s) ? s.GetString() ?? "pending" : "pending";

        var sslStatus = "pending_validation";
        string? txtName = null, txtValue = null;

        if (result.TryGetProperty("ssl", out var ssl))
        {
            sslStatus = ssl.TryGetProperty("status", out var ss) ? ss.GetString() ?? "pending_validation" : "pending_validation";

            if (ssl.TryGetProperty("validation_records", out var vr) && vr.ValueKind == JsonValueKind.Array)
            {
                foreach (var rec in vr.EnumerateArray())
                {
                    if (rec.TryGetProperty("txt_name", out var tn))  txtName  = tn.GetString();
                    if (rec.TryGetProperty("txt_value", out var tv)) txtValue = tv.GetString();
                    break;
                }
            }
        }

        return new CloudflareHostnameResult(id, hostname, status, sslStatus, txtName, txtValue);
    }
}
