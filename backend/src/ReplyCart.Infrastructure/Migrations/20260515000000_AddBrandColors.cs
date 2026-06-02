using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations;

public partial class AddBrandColors : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "SecondaryColor",
            table: "StorefrontSettings",
            type: "nvarchar(20)",
            maxLength: 20,
            nullable: false,
            defaultValue: "#134E4A");

        migrationBuilder.AddColumn<string>(
            name: "AccentColor",
            table: "StorefrontSettings",
            type: "nvarchar(20)",
            maxLength: 20,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "SecondaryColor", table: "StorefrontSettings");
        migrationBuilder.DropColumn(name: "AccentColor",    table: "StorefrontSettings");
    }
}
