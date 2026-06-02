namespace ReplyCart.Application.Common.Models;

public class PagedList<T>
{
    public IReadOnlyList<T> Items { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public PagedList(IReadOnlyList<T> items, int page, int pageSize, int totalCount)
    {
        Items = items;
        Page = page;
        PageSize = pageSize;
        TotalCount = totalCount;
    }

    public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source, int page, int pageSize)
    {
        var count = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(source);
        var items = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
            source.Skip((page - 1) * pageSize).Take(pageSize));
        return new PagedList<T>(items, page, pageSize, count);
    }
}

public record PaginationParams(int Page = 1, int PageSize = 20);
