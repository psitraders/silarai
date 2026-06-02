using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations;

public partial class AddCountryLanguage : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Country",
            table: "Businesses",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "India");

        migrationBuilder.AddColumn<string>(
            name: "Language",
            table: "Businesses",
            type: "nvarchar(10)",
            maxLength: 10,
            nullable: false,
            defaultValue: "en");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "Country", table: "Businesses");
        migrationBuilder.DropColumn(name: "Language", table: "Businesses");
    }
}
