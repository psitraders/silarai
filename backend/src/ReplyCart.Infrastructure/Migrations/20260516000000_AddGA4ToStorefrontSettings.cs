using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations;

public partial class AddGA4ToStorefrontSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "GA4MeasurementId",
            table: "StorefrontSettings",
            type: "nvarchar(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "GA4PropertyId",
            table: "StorefrontSettings",
            type: "nvarchar(50)",
            maxLength: 50,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "GA4MeasurementId", table: "StorefrontSettings");
        migrationBuilder.DropColumn(name: "GA4PropertyId",    table: "StorefrontSettings");
    }
}
