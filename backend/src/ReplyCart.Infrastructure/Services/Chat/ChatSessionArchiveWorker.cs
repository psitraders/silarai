using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Infrastructure.Services.Chat;

/// <summary>
/// Drains the <see cref="SqlChatSessionArchive"/> queue.
///
/// One scoped DbContext per job keeps failures isolated — a single poisoned job can
/// never take down the drain loop or corrupt the change tracker for later jobs.
/// Errors are logged and swallowed; archiving is best-effort by design.
/// </summary>
public sealed class ChatSessionArchiveWorker(
    SqlChatSessionArchive              archive,
    IServiceScopeFactory               scopeFactory,
    ILogger<ChatSessionArchiveWorker>  logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Chatbot session archive worker started.");

        try
        {
            await foreach (var job in archive.Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    await archive.PersistAsync(job, db, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to archive chatbot session job for {Client}/{Session}.",
                        job.Key.ClientId, job.Key.SessionId);
                }
            }
        }
        catch (OperationCanceledException)
        {
            // normal shutdown
        }

        logger.LogInformation("Chatbot session archive worker stopped.");
    }
}
