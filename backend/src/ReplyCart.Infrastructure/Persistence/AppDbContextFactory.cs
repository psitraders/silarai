using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Persistence;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // dotnet ef ignores Program.cs/DI, so the connection string has to be supplied here.
        // Default matches appsettings.Development.json (Dockerized SQL Server on localhost:1433);
        // override with ConnectionStrings__DefaultConnection if your local setup differs.
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Server=localhost,1433;Database=ReplyCart;User Id=sa;Password=Homecbe@74;TrustServerCertificate=True;MultipleActiveResultSets=true;";

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

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


