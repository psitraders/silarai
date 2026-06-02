using System.Text.Json;

namespace ReplyCart.Api.Services;

/// <summary>
/// Calls the Google Analytics Data API v1beta using a single platform-level
/// OAuth refresh token. Merchants only need to add the platform Google account
/// (GoogleAnalytics:PlatformEmail) as a Viewer on their GA4 property.
/// </summary>
public class GA4AnalyticsService(IHttpClientFactory httpFactory, IConfiguration config)
{
    private const string DataApiBase   = "https://analyticsdata.googleapis.com/v1beta";
    private const string TokenEndpoint = "https://oauth2.googleapis.com/token";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(config["GoogleAnalytics:PlatformRefreshToken"]) &&
        !string.IsNullOrWhiteSpace(config["GoogleAnalytics:ClientId"]) &&
        !string.IsNullOrWhiteSpace(config["GoogleAnalytics:ClientSecret"]);

    public string PlatformEmail =>
        config["GoogleAnalytics:PlatformEmail"] ?? "analytics@replycart.com";

    private async Task<string> GetAccessTokenAsync(CancellationToken ct)
    {
        var refreshToken = config["GoogleAnalytics:PlatformRefreshToken"] ?? throw new InvalidOperationException("Platform refresh token not configured.");
        var clientId     = config["GoogleAnalytics:ClientId"]             ?? throw new InvalidOperationException("GoogleAnalytics:ClientId not configured.");
        var clientSecret = config["GoogleAnalytics:ClientSecret"]         ?? throw new InvalidOperationException("GoogleAnalytics:ClientSecret not configured.");

        var http     = httpFactory.CreateClient();
        var response = await http.PostAsync(TokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["refresh_token"] = refreshToken,
            ["client_id"]     = clientId,
            ["client_secret"] = clientSecret,
            ["grant_type"]    = "refresh_token",
        }), ct);

        var json = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Failed to refresh access token: {json}");

        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("access_token").GetString()
               ?? throw new InvalidOperationException("No access_token in response.");
    }

    public async Task<GA4ReportResult> RunReportAsync(string propertyId, string startDate, string endDate, CancellationToken ct)
    {
        var accessToken = await GetAccessTokenAsync(ct);
        var client      = httpFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var url = $"{DataApiBase}/properties/{propertyId}:runReport";

        async Task<JsonDocument> Post(object body)
        {
            var response = await client.PostAsJsonAsync(url, body, ct);
            var content  = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"GA4 API error {response.StatusCode}: {content}");
            return JsonDocument.Parse(content);
        }

        var kpis = await Post(new
        {
            dateRanges = new[] { new { startDate, endDate } },
            metrics = new object[]
            {
                new { name = "sessions" },
                new { name = "activeUsers" },
                new { name = "screenPageViews" },
                new { name = "bounceRate" },
                new { name = "averageSessionDuration" },
            },
            dimensions = Array.Empty<object>(),
        });
        var topPages = await Post(new { dateRanges = new[] { new { startDate, endDate } }, metrics = new[] { new { name = "screenPageViews" } }, dimensions = new[] { new { name = "pagePath" } }, orderBys = new[] { new { metric = new { metricName = "screenPageViews" }, desc = true } }, limit = 10 });
        var devices  = await Post(new { dateRanges = new[] { new { startDate, endDate } }, metrics = new[] { new { name = "sessions" } }, dimensions = new[] { new { name = "deviceCategory" } }, limit = 5 });
        var traffic  = await Post(new { dateRanges = new[] { new { startDate, endDate } }, metrics = new[] { new { name = "sessions" } }, dimensions = new[] { new { name = "sessionDefaultChannelGroup" } }, limit = 8 });
        var trend    = await Post(new { dateRanges = new[] { new { startDate, endDate } }, metrics = new[] { new { name = "sessions" } }, dimensions = new[] { new { name = "date" } }, orderBys = new[] { new { dimension = new { dimensionName = "date" }, desc = false } }, limit = 60 });

        return new GA4ReportResult
        {
            Sessions              = GetMetricValue(kpis, 0, 0),
            Users                 = GetMetricValue(kpis, 0, 1),
            PageViews             = GetMetricValue(kpis, 0, 2),
            BounceRate            = GetMetricDouble(kpis, 0, 3),
            AvgSessionDurationSec = GetMetricDouble(kpis, 0, 4),
            TopPages              = GetDimensionMetric(topPages),
            DeviceBreakdown       = GetDimensionMetric(devices),
            TrafficSources        = GetDimensionMetric(traffic),
            SessionTrend          = GetDimensionMetric(trend),
        };
    }

    private static long GetMetricValue(JsonDocument doc, int r, int m)
    { try { return long.TryParse(doc.RootElement.GetProperty("rows")[r].GetProperty("metricValues")[m].GetProperty("value").GetString(), out var n) ? n : 0; } catch { return 0; } }

    private static double GetMetricDouble(JsonDocument doc, int r, int m)
    { try { var v = doc.RootElement.GetProperty("rows")[r].GetProperty("metricValues")[m].GetProperty("value").GetString(); return double.TryParse(v, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var d) ? Math.Round(d, 2) : 0; } catch { return 0; } }

    private static List<DimMetricItem> GetDimensionMetric(JsonDocument doc)
    {
        var result = new List<DimMetricItem>();
        try { if (!doc.RootElement.TryGetProperty("rows", out var rows)) return result; foreach (var row in rows.EnumerateArray()) { var dim = row.GetProperty("dimensionValues")[0].GetProperty("value").GetString() ?? ""; var valStr = row.GetProperty("metricValues")[0].GetProperty("value").GetString() ?? "0"; long.TryParse(valStr, out var val); result.Add(new DimMetricItem(dim, val)); } } catch { }
        return result;
    }
}

public class GA4ReportResult
{
    public long   Sessions              { get; set; }
    public long   Users                 { get; set; }
    public long   PageViews             { get; set; }
    public double BounceRate            { get; set; }
    public double AvgSessionDurationSec { get; set; }
    public List<DimMetricItem> TopPages        { get; set; } = [];
    public List<DimMetricItem> DeviceBreakdown { get; set; } = [];
    public List<DimMetricItem> TrafficSources  { get; set; } = [];
    public List<DimMetricItem> SessionTrend    { get; set; } = [];
}

public record DimMetricItem(string Dimension, long Value);
