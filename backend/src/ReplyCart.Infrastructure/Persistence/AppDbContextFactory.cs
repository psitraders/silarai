using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Persistence;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=ReplyCart_Dev;Trusted_Connection=true;");

        var tenantContext = new NullTenantContext();
        var currentUser = new NullCurrentUser();

        return new AppDbContext(optionsBuilder.Options, tenantContext, currentUser);
    }
}

public class NullTenantContext : ITenantContext
{
    public Guid CurrentTenantId => Guid.Empty;
    public string? CurrentTenantSlug => null;
    public bool IsResolved => false;
    public void SetTenant(Guid tenantId, string slug) { }
}

public class NullCurrentUser : ICurrentUser
{
    public Guid? UserId => null;
    public Guid? TenantId => null;
    public string? Email => null;
    public string? Name => null;
    public IEnumerable<string> Roles => [];
    public bool IsAuthenticated => false;
    public bool IsInRole(string role) => false;
}


