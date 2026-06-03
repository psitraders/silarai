using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Analytics.Queries;

public record GetDashboardKpisQuery(int PeriodDays = 7) : IRequest<DashboardKpiDto>;

public record DashboardKpiDto(
    int NewInquiries,
    int NewInquiriesChange,
    int PendingFollowUps,
    int PendingFollowUpsChange,
    int OrdersThisWeek,
    int OrdersThisWeekChange,
    double ConversionRate,
    double ConversionRateChange,
    decimal TotalRevenue,
    IEnumerable<TopProductDto> TopProducts,
    IEnumerable<RecentLeadDto> RecentLeads,
    OrderPipelineDto OrderPipeline,
    IEnumerable<SalesDataPoint> SalesChart,
    IEnumerable<LowStockProductDto> LowStockProducts,
    double RepeatCustomerRate,
    int TotalCustomers,
    int RepeatCustomers
);

public record TopProductDto(Guid Id, string Title, int OrderCount, string? ImageUrl);
public record LowStockProductDto(Guid Id, string Title, int StockQuantity, string? ImageUrl);
public record RecentLeadDto(Guid Id, string CustomerName, string? Channel, string? ProductTitle, LeadStatus Status, DateTime CreatedAt);
public record OrderPipelineDto(int New, int Confirmed, int PaymentPending, int Paid, int Delivered);
public record SalesDataPoint(string Label, decimal Amount, int OrderCount);

public class GetDashboardKpisQueryHandler(IAppDbContext db, ITenantContext tenantContext, IMemoryCache cache)
    : IRequestHandler<GetDashboardKpisQuery, DashboardKpiDto>
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<DashboardKpiDto> Handle(GetDashboardKpisQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var cacheKey = $"dashboard_kpis_{tenantId}_{request.PeriodDays}";

        if (cache.TryGetValue(cacheKey, out DashboardKpiDto? cached) && cached is not null)
            return cached;

        var now = DateTime.UtcNow;
        var periodStart    = now.AddDays(-request.PeriodDays);
        var prevPeriodStart = periodStart.AddDays(-request.PeriodDays);

        // ── Run all independent queries in parallel to minimise round-trips ──

        // Leads counts (current + prev period in one query each)
        var leadsCurrentTask = db.Leads
            .Where(l => l.TenantId == tenantId && l.CreatedAt >= periodStart)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total     = g.Count(),
                Converted = g.Count(l => l.Status == LeadStatus.OrderConfirmed),
            })
            .FirstOrDefaultAsync(cancellationToken);

        var leadsPrevTask = db.Leads
            .Where(l => l.TenantId == tenantId && l.CreatedAt >= prevPeriodStart && l.CreatedAt < periodStart)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total          = g.Count(),
                Converted      = g.Count(l => l.Status == LeadStatus.OrderConfirmed),
                FollowUpPending = g.Count(l => l.Status == LeadStatus.FollowUpPending),
            })
            .FirstOrDefaultAsync(cancellationToken);

        var pendingFollowUpsTask = db.Leads
            .CountAsync(l => l.TenantId == tenantId
                          && l.Status == LeadStatus.FollowUpPending
                          && l.FollowUpDate <= now.AddDays(3), cancellationToken);

        // Orders: current period count + prev period count + pipeline — all in one query
        var orderStatsTask = db.Orders
            .Where(o => o.TenantId == tenantId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                CurrentPeriod     = g.Count(o => o.CreatedAt >= periodStart),
                PrevPeriod        = g.Count(o => o.CreatedAt >= prevPeriodStart && o.CreatedAt < periodStart),
                PipelineNew       = g.Count(o => o.Status == OrderStatus.New),
                PipelineConfirmed = g.Count(o => o.Status == OrderStatus.Confirmed),
                PipelinePayPend   = g.Count(o => o.Status == OrderStatus.PaymentPending),
                PipelinePaid      = g.Count(o => o.Status == OrderStatus.Paid),
                PipelineDelivered = g.Count(o => o.Status == OrderStatus.Delivered),
                TotalRevenue      = g.Where(o => o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Paid)
                                     .Sum(o => (decimal?)o.TotalAmount) ?? 0m,
            })
            .FirstOrDefaultAsync(cancellationToken);

        // Repeat customer rate — fully server-side
        var repeatRateTask = db.Orders
            .Where(o => o.TenantId == tenantId && o.CustomerId != null)
            .GroupBy(o => o.CustomerId)
            .Select(g => new { Count = g.Count() })
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total  = g.Count(),
                Repeat = g.Count(x => x.Count > 1),
            })
            .FirstOrDefaultAsync(cancellationToken);

        // Sales chart (last 7 days)
        var salesTask = db.Orders
            .Where(o => o.TenantId == tenantId && o.CreatedAt >= now.AddDays(-7))
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new SalesDataPoint(
                g.Key.ToString("ddd"),
                g.Sum(o => o.TotalAmount),
                g.Count()))
            .ToListAsync(cancellationToken);

        // Top products
        var topProductsTask = db.OrderItems
            .Where(i => i.TenantId == tenantId)
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .Join(db.Products, x => x.ProductId, p => p.Id,
                (x, p) => new TopProductDto(
                    p.Id, p.Title, x.Count,
                    p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()))
            .ToListAsync(cancellationToken);

        // Recent leads
        var recentLeadsTask = db.Leads
            .Where(l => l.TenantId == tenantId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(5)
            .Select(l => new RecentLeadDto(l.Id, l.CustomerName,
                l.SourceChannel.ToString(), null, l.Status, l.CreatedAt))
            .ToListAsync(cancellationToken);

        // Low stock products
        var lowStockTask = db.Products
            .Where(p => p.TenantId == tenantId
                     && p.Status == ProductStatus.Active
                     && p.StockQuantity != null
                     && p.StockQuantity > 0
                     && p.StockQuantity <= 5)
            .OrderBy(p => p.StockQuantity)
            .Take(8)
            .Select(p => new LowStockProductDto(
                p.Id, p.Title, p.StockQuantity ?? 0,
                p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()))
            .ToListAsync(cancellationToken);

        // ── Await all in parallel ──
        await Task.WhenAll(
            leadsCurrentTask, leadsPrevTask, pendingFollowUpsTask,
            orderStatsTask, repeatRateTask,
            salesTask, topProductsTask, recentLeadsTask, lowStockTask);

        var lc   = leadsCurrentTask.Result;
        var lp   = leadsPrevTask.Result;
        var os   = orderStatsTask.Result;
        var rr   = repeatRateTask.Result;

        var newInquiries        = lc?.Total ?? 0;
        var prevInquiries       = lp?.Total ?? 0;
        var convertedLeads      = lc?.Converted ?? 0;
        var prevConverted       = lp?.Converted ?? 0;
        var prevPendingFU       = lp?.FollowUpPending ?? 0;
        var pendingFollowUps    = pendingFollowUpsTask.Result;

        var ordersThisWeek = os?.CurrentPeriod ?? 0;
        var prevOrders     = os?.PrevPeriod ?? 0;
        var totalRevenue   = os?.TotalRevenue ?? 0m;

        var conversionRate     = newInquiries > 0 ? (double)convertedLeads / newInquiries * 100 : 0;
        var prevConversionRate = prevInquiries > 0 ? (double)prevConverted  / prevInquiries * 100 : 0;

        var totalCustomers  = rr?.Total ?? 0;
        var repeatCustomers = rr?.Repeat ?? 0;
        var repeatRate      = totalCustomers > 0 ? Math.Round((double)repeatCustomers / totalCustomers * 100, 1) : 0;

        var pipeline = new OrderPipelineDto(
            os?.PipelineNew ?? 0,
            os?.PipelineConfirmed ?? 0,
            os?.PipelinePayPend ?? 0,
            os?.PipelinePaid ?? 0,
            os?.PipelineDelivered ?? 0);

        var result = new DashboardKpiDto(
            newInquiries,
            prevInquiries > 0 ? (int)((newInquiries - prevInquiries) * 100.0 / prevInquiries) : 0,
            pendingFollowUps,
            prevPendingFU > 0 ? (int)((pendingFollowUps - prevPendingFU) * 100.0 / prevPendingFU) : 0,
            ordersThisWeek,
            prevOrders > 0 ? (int)((ordersThisWeek - prevOrders) * 100.0 / prevOrders) : 0,
            Math.Round(conversionRate, 1),
            Math.Round(conversionRate - prevConversionRate, 1),
            totalRevenue,
            topProductsTask.Result,
            recentLeadsTask.Result,
            pipeline,
            salesTask.Result,
            lowStockTask.Result,
            repeatRate,
            totalCustomers,
            repeatCustomers);

        cache.Set(cacheKey, result, CacheTtl);
        return result;
    }
}


