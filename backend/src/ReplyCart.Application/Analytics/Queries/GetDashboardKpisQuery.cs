using MediatR;
using Microsoft.EntityFrameworkCore;
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
    IEnumerable<LowStockProductDto> LowStockProducts
);

public record TopProductDto(Guid Id, string Title, int OrderCount, string? ImageUrl);
public record LowStockProductDto(Guid Id, string Title, int StockQuantity, string? ImageUrl);
public record RecentLeadDto(Guid Id, string CustomerName, string? Channel, string? ProductTitle, LeadStatus Status, DateTime CreatedAt);
public record OrderPipelineDto(int New, int Confirmed, int PaymentPending, int Paid, int Delivered);
public record SalesDataPoint(string Label, decimal Amount, int OrderCount);

public class GetDashboardKpisQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetDashboardKpisQuery, DashboardKpiDto>
{
    public async Task<DashboardKpiDto> Handle(GetDashboardKpisQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var now = DateTime.UtcNow;
        var periodStart = now.AddDays(-request.PeriodDays);
        var prevPeriodStart = periodStart.AddDays(-request.PeriodDays);

        var newInquiries = await db.Leads.CountAsync(l => l.TenantId == tenantId && l.CreatedAt >= periodStart, cancellationToken);
        var prevInquiries = await db.Leads.CountAsync(l => l.TenantId == tenantId && l.CreatedAt >= prevPeriodStart && l.CreatedAt < periodStart, cancellationToken);

        var pendingFollowUps = await db.Leads.CountAsync(l => l.TenantId == tenantId
            && l.Status == LeadStatus.FollowUpPending && l.FollowUpDate <= now.AddDays(3), cancellationToken);

        // Prev-period pending follow-ups: same criteria but as of periodStart
        var prevPendingFollowUps = await db.Leads.CountAsync(l => l.TenantId == tenantId
            && l.Status == LeadStatus.FollowUpPending
            && l.CreatedAt >= prevPeriodStart && l.CreatedAt < periodStart, cancellationToken);
        var pendingFollowUpsChange = prevPendingFollowUps > 0
            ? (int)((pendingFollowUps - prevPendingFollowUps) * 100.0 / prevPendingFollowUps)
            : 0;

        var ordersThisWeek = await db.Orders.CountAsync(o => o.TenantId == tenantId && o.CreatedAt >= periodStart, cancellationToken);
        var prevOrders = await db.Orders.CountAsync(o => o.TenantId == tenantId && o.CreatedAt >= prevPeriodStart && o.CreatedAt < periodStart, cancellationToken);

        var totalLeads = await db.Leads.CountAsync(l => l.TenantId == tenantId && l.CreatedAt >= periodStart, cancellationToken);
        var convertedLeads = await db.Leads.CountAsync(l => l.TenantId == tenantId && l.CreatedAt >= periodStart && l.Status == LeadStatus.OrderConfirmed, cancellationToken);
        var conversionRate = totalLeads > 0 ? (double)convertedLeads / totalLeads * 100 : 0;

        // Previous period conversion rate for trend
        var prevTotalLeads     = await db.Leads.CountAsync(l => l.TenantId == tenantId && l.CreatedAt >= prevPeriodStart && l.CreatedAt < periodStart, cancellationToken);
        var prevConvertedLeads = await db.Leads.CountAsync(l => l.TenantId == tenantId && l.CreatedAt >= prevPeriodStart && l.CreatedAt < periodStart && l.Status == LeadStatus.OrderConfirmed, cancellationToken);
        var prevConversionRate = prevTotalLeads > 0 ? (double)prevConvertedLeads / prevTotalLeads * 100 : 0;
        var conversionRateChange = Math.Round(conversionRate - prevConversionRate, 1);

        var totalRevenue = await db.Orders.Where(o => o.TenantId == tenantId && o.Status == OrderStatus.Delivered)
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var topProducts = await db.OrderItems
            .Where(i => i.TenantId == tenantId)
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .Join(db.Products, x => x.ProductId, p => p.Id, (x, p) => new TopProductDto(
                p.Id, p.Title, x.Count,
                p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()))
            .ToListAsync(cancellationToken);

        var recentLeads = await db.Leads
            .Where(l => l.TenantId == tenantId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(5)
            .Select(l => new RecentLeadDto(l.Id, l.CustomerName,
                l.SourceChannel.ToString(), null, l.Status, l.CreatedAt))
            .ToListAsync(cancellationToken);

        var pipeline = new OrderPipelineDto(
            await db.Orders.CountAsync(o => o.TenantId == tenantId && o.Status == OrderStatus.New, cancellationToken),
            await db.Orders.CountAsync(o => o.TenantId == tenantId && o.Status == OrderStatus.Confirmed, cancellationToken),
            await db.Orders.CountAsync(o => o.TenantId == tenantId && o.Status == OrderStatus.PaymentPending, cancellationToken),
            await db.Orders.CountAsync(o => o.TenantId == tenantId && o.Status == OrderStatus.Paid, cancellationToken),
            await db.Orders.CountAsync(o => o.TenantId == tenantId && o.Status == OrderStatus.Delivered, cancellationToken)
        );

        var salesData = await db.Orders
            .Where(o => o.TenantId == tenantId && o.CreatedAt >= now.AddDays(-7))
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new SalesDataPoint(g.Key.ToString("ddd"), g.Sum(o => o.TotalAmount), g.Count()))
            .ToListAsync(cancellationToken);

        var lowStockProducts = await db.Products
            .Where(p => p.TenantId == tenantId
                     && p.Status == ProductStatus.Active
                     && p.StockQuantity != null
                     && p.StockQuantity > 0
                     && p.StockQuantity <= 5)
            .OrderBy(p => p.StockQuantity)
            .Take(8)
            .Select(p => new LowStockProductDto(
                p.Id,
                p.Title,
                p.StockQuantity ?? 0,
                p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()))
            .ToListAsync(cancellationToken);

        return new DashboardKpiDto(
            newInquiries,
            prevInquiries > 0 ? (int)((newInquiries - prevInquiries) * 100.0 / prevInquiries) : 0,
            pendingFollowUps,
            pendingFollowUpsChange,
            ordersThisWeek,
            prevOrders > 0 ? (int)((ordersThisWeek - prevOrders) * 100.0 / prevOrders) : 0,
            Math.Round(conversionRate, 1),
            conversionRateChange,
            totalRevenue,
            topProducts,
            recentLeads,
            pipeline,
            salesData,
            lowStockProducts
        );
    }
}
