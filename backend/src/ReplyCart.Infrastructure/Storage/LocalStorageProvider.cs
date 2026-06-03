using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Storage;

public class LocalStorageProvider(IWebHostEnvironment env, IConfiguration configuration) : IStorageProvider
{
    private readonly string _baseUrl = configuration["Storage:LocalBaseUrl"] ?? "http://localhost:5000";

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string folder, CancellationToken cancellationToken = default)
    {
        var uploadsPath = Path.Combine(env.WebRootPath, "uploads", folder);
        Directory.CreateDirectory(uploadsPath);

        var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var filePath = Path.Combine(uploadsPath, uniqueName);

        await using var stream = File.Create(filePath);
        await fileStream.CopyToAsync(stream, cancellationToken);

        return $"uploads/{folder}/{uniqueName}";
    }

    public Task DeleteAsync(string blobPath, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(env.WebRootPath, blobPath.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(filePath))
            File.Delete(filePath);
        return Task.CompletedTask;
    }

    public string GetPublicUrl(string blobPath) => $"{_baseUrl}/{blobPath}";
}


