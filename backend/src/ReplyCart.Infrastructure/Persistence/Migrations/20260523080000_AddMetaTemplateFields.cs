using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class AddMetaTemplateFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "MetaTemplateId",
            table: "WaTemplates",
            type: "nvarchar(max)",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "MetaStatus",
            table: "WaTemplates",
            type: "nvarchar(50)",
            maxLength: 50,
            nullable: false,
            defaultValue: "LOCAL");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "MetaTemplateId", table: "WaTemplates");
        migrationBuilder.DropColumn(name: "MetaStatus",     table: "WaTemplates");
    }
}
