using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations;

/// <summary>
/// Data migration: any product that is currently Active (Status=2) but has
/// StockQuantity = 0 is automatically moved to OutOfStock (Status=4).
/// This brings existing data in line with the new auto-stock-management logic.
/// </summary>
public partial class AutoOutOfStockExistingProducts : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // ProductStatus.Active = 2, ProductStatus.OutOfStock = 4
        migrationBuilder.Sql(@"
            UPDATE Products
            SET    Status = 4
            WHERE  Status = 2
              AND  StockQuantity IS NOT NULL
              AND  StockQuantity <= 0;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Cannot reliably reverse a data migration — leave products as OutOfStock on rollback
    }
}
