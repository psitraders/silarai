using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Storage;

public class CloudinaryStorageProvider : IStorageProvider
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageProvider(IConfiguration configuration)
    {
        var cloudName = configuration["Storage:Cloudinary:CloudName"]!;
        var apiKey    = configuration["Storage:Cloudinary:ApiKey"]!;
        var apiSecret = configuration["Storage:Cloudinary:ApiSecret"]!;

        var account   = new Account(cloudName, apiKey, apiSecret);
        _cloudinary   = new Cloudinary(account) { Api = { Secure = true } };
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File        = new FileDescription(fileName, fileStream),
            Folder      = $"replycart/{folder}",
            UseFilename = false,
            UniqueFilename = true,
            Overwrite   = false,
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

        // Return the Cloudinary public_id so we can delete later; the URL is stable
        return result.SecureUrl.ToString();
    }

    public async Task DeleteAsync(string blobPath, CancellationToken cancellationToken = default)
    {
        // blobPath for Cloudinary is the full secure URL; derive public_id from it
        // URL pattern: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<publicId>.<ext>
        try
        {
            var uri      = new Uri(blobPath);
            var segments = uri.AbsolutePath.Split('/');
            // Find the "upload" segment and take everything after it (minus the version segment)
            var uploadIdx = Array.IndexOf(segments, "upload");
            if (uploadIdx >= 0 && uploadIdx < segments.Length - 1)
            {
                // Skip the version segment (starts with 'v' followed by digits)
                var afterUpload = segments.Skip(uploadIdx + 1).ToArray();
                if (afterUpload.Length > 0 && afterUpload[0].StartsWith('v') && afterUpload[0].Length > 1 && char.IsDigit(afterUpload[0][1]))
                    afterUpload = afterUpload.Skip(1).ToArray();

                var publicIdWithExt = string.Join("/", afterUpload);
                var publicId        = Path.GetFileNameWithoutExtension(publicIdWithExt);
                var folder          = string.Join("/", afterUpload.Take(afterUpload.Length - 1));
                var fullPublicId    = afterUpload.Length > 1 ? $"{folder}/{publicId}" : publicId;

                await _cloudinary.DestroyAsync(new DeletionParams(fullPublicId));
            }
        }
        catch
        {
            // Best-effort delete — don't fail the request if Cloudinary delete fails
        }
    }

    public string GetPublicUrl(string blobPath)
    {
        // blobPath is already a full Cloudinary HTTPS URL
        return blobPath;
    }
}


