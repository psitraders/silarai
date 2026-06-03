namespace ReplyCart.Application.Common.Interfaces;

public interface IStorageProvider
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string folder, CancellationToken cancellationToken = default);
    Task DeleteAsync(string blobPath, CancellationToken cancellationToken = default);
    string GetPublicUrl(string blobPath);
}


