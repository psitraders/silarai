using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Customers.Commands;

/// <summary>
/// Scans all customers for the tenant, finds duplicate groups by normalised phone or email,
/// and auto-merges each group into a single primary record (the one with the most orders /
/// highest spend / earliest creation date — in that priority order).
/// Returns a summary of how many groups and individual records were merged.
/// </summary>
public record SmartMergeCustomersCommand : IRequest<SmartMergeResult>;

public record SmartMergeResult(int GroupsMerged, int CustomersMerged);

public class SmartMergeCustomersCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<SmartMergeCustomersCommand, SmartMergeResult>
{
    public async Task<SmartMergeResult> Handle(SmartMergeCustomersCommand request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        // Load all customers (including full data needed for merging)
        var all = await db.Customers
            .Where(c => c.TenantId == tenantId)
            .ToListAsync(ct);

        if (all.Count < 2)
            return new SmartMergeResult(0, 0);

        // ── Build adjacency list (shared normalised-phone or email) ──────────────
        // Index by normalised phone and by email for fast lookup
        var phoneIndex = new Dictionary<string, List<int>>(StringComparer.OrdinalIgnoreCase);
        var emailIndex = new Dictionary<string, List<int>>(StringComparer.OrdinalIgnoreCase);

        for (int i = 0; i < all.Count; i++)
        {
            var c = all[i];
            var phone = NormalizePhone(c.PhoneNumber);
            if (phone.Length >= 7)
            {
                if (!phoneIndex.TryGetValue(phone, out var pl)) phoneIndex[phone] = pl = [];
                pl.Add(i);
            }
            var email = c.Email?.Trim().ToLower();
            if (!string.IsNullOrEmpty(email))
            {
                if (!emailIndex.TryGetValue(email, out var el)) emailIndex[email] = el = [];
                el.Add(i);
            }
        }

        // ── Union-Find to group connected customers ───────────────────────────────
        var parent = Enumerable.Range(0, all.Count).ToArray();

        int Find(int x)
        {
            while (parent[x] != x)
            {
                parent[x] = parent[parent[x]]; // path compression
                x = parent[x];
            }
            return x;
        }

        void Union(int a, int b)
        {
            var ra = Find(a);
            var rb = Find(b);
            if (ra != rb) parent[ra] = rb;
        }

        foreach (var group in phoneIndex.Values.Where(g => g.Count > 1))
            for (int k = 1; k < group.Count; k++)
                Union(group[0], group[k]);

        foreach (var group in emailIndex.Values.Where(g => g.Count > 1))
            for (int k = 1; k < group.Count; k++)
                Union(group[0], group[k]);

        // ── Identify duplicate groups ─────────────────────────────────────────────
        var groups = all
            .Select((c, i) => (customer: c, root: Find(i)))
            .GroupBy(x => x.root)
            .Where(g => g.Count() > 1)
            .ToList();

        if (groups.Count == 0)
            return new SmartMergeResult(0, 0);

        // ── Merge each group ──────────────────────────────────────────────────────
        int groupsMerged  = 0;
        int customersMerged = 0;

        foreach (var group in groups)
        {
            var members = group.Select(x => x.customer).ToList();

            // Pick primary: most orders → most spend → oldest (smallest CreatedAt)
            var primary = members
                .OrderByDescending(c => c.TotalOrders)
                .ThenByDescending(c => c.TotalSpend)
                .ThenBy(c => c.CreatedAt)
                .First();

            var toMerge = members.Where(c => c.Id != primary.Id).ToList();

            foreach (var source in toMerge)
            {
                // Re-link orders
                var orders = await db.Orders
                    .Where(o => o.CustomerId == source.Id)
                    .ToListAsync(ct);
                foreach (var o in orders)
                    o.CustomerId = primary.Id;

                // Re-link leads
                var leads = await db.Leads
                    .Where(l => l.CustomerId == source.Id)
                    .ToListAsync(ct);
                foreach (var l in leads)
                    l.CustomerId = primary.Id;

                // Merge stats
                primary.TotalOrders += source.TotalOrders;
                primary.TotalSpend  += source.TotalSpend;
                if (source.LastOrderDate > primary.LastOrderDate)
                    primary.LastOrderDate = source.LastOrderDate;

                // Merge notes
                if (!string.IsNullOrWhiteSpace(source.Notes))
                    primary.Notes = string.IsNullOrWhiteSpace(primary.Notes)
                        ? source.Notes
                        : $"{primary.Notes}\n\n[Merged] {source.Notes}";

                // Merge tags (de-dupe)
                if (!string.IsNullOrWhiteSpace(source.Tags))
                {
                    var existing = (primary.Tags ?? "")
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(t => t.Trim())
                        .ToHashSet(StringComparer.OrdinalIgnoreCase);
                    var newTags = source.Tags
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(t => t.Trim())
                        .Where(t => !existing.Contains(t));
                    primary.Tags = string.Join(", ", existing.Concat(newTags));
                }

                // Fill primary's missing fields from source
                if (string.IsNullOrEmpty(primary.Email) && !string.IsNullOrEmpty(source.Email))
                    primary.Email = source.Email;
                if (string.IsNullOrEmpty(primary.Address) && !string.IsNullOrEmpty(source.Address))
                    primary.Address = source.Address;
                if (string.IsNullOrEmpty(primary.City) && !string.IsNullOrEmpty(source.City))
                    primary.City = source.City;

                // Soft-delete the duplicate
                source.IsDeleted = true;
                source.DeletedAt = DateTime.UtcNow;

                customersMerged++;
            }

            groupsMerged++;
        }

        await db.SaveChangesAsync(ct);
        return new SmartMergeResult(groupsMerged, customersMerged);
    }

    private static string NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        return new string(phone.Where(char.IsDigit).ToArray());
    }
}


