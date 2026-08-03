namespace ReplyCart.Infrastructure.Configuration;

/// <summary>
/// Binds the "Redis" configuration section (Azure Managed Redis).
///
/// The project keeps a single appsettings.json (no per-environment files), so the
/// values here are the committed defaults. Override any of them per environment with
/// App Service application settings using the Redis__&lt;Key&gt; form, e.g.
/// Redis__Enabled, Redis__Endpoint, Redis__AccessKey, Redis__ConnectionString.
/// </summary>
public sealed class RedisOptions
{
    public const string SectionName = "Redis";

    /// <summary>Master switch. When false the chatbot falls back to the in-process store only.</summary>
    public bool Enabled { get; set; }

    /// <summary>Full StackExchange.Redis connection string. Takes precedence over Endpoint/AccessKey.</summary>
    public string? ConnectionString { get; set; }

    /// <summary>host:port, e.g. "silarai-ecs.southeastasia.redis.azure.net:10000".</summary>
    public string? Endpoint { get; set; }

    /// <summary>Primary (or secondary) access key. Used as the Redis password.</summary>
    public string? AccessKey { get; set; }

    /// <summary>Sliding TTL for a buyer's chat session. Refreshed on every read/write.</summary>
    public int SessionTtlHours { get; set; } = 24;

    /// <summary>Per-operation budget. Exceeding it trips the circuit breaker and degrades to in-memory.</summary>
    public int TimeoutMs { get; set; } = 250;

    /// <summary>Consecutive failures before the circuit opens.</summary>
    public int CircuitFailureThreshold { get; set; } = 3;

    /// <summary>How long the circuit stays open before probing Redis again.</summary>
    public int CircuitOpenSeconds { get; set; } = 30;

    /// <summary>Key namespace root.</summary>
    public string KeyPrefix { get; set; } = "rc:bot";

    /// <summary>Messages retained per session (user + assistant combined).</summary>
    public int MaxMessages { get; set; } = 40;

    /// <summary>TTL for the cached per-client catalogue / knowledge-base chunks.</summary>
    public int CatalogCacheSeconds { get; set; } = 300;

    /// <summary>TTL for the cached apiKey -> client config lookup.</summary>
    public int ClientCacheSeconds { get; set; } = 60;

    public bool IsConfigured =>
        Enabled && (!string.IsNullOrWhiteSpace(ConnectionString) || !string.IsNullOrWhiteSpace(Endpoint));

    /// <summary>
    /// Builds the StackExchange.Redis configuration string.
    /// abortConnect=False so a cold/unavailable Redis never blocks application start-up.
    /// </summary>
    public string BuildConnectionString()
    {
        if (!string.IsNullOrWhiteSpace(ConnectionString))
            return ConnectionString!;

        var endpoint = (Endpoint ?? string.Empty).Trim();
        var opTimeout = Math.Max(TimeoutMs * 4, 1000);

        var cfg = $"{endpoint},ssl=True,abortConnect=False,connectTimeout=5000," +
                  $"syncTimeout={opTimeout},asyncTimeout={opTimeout},connectRetry=3,keepAlive=60";

        if (!string.IsNullOrWhiteSpace(AccessKey))
            cfg += $",password={AccessKey}";

        return cfg;
    }
}
