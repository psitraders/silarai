using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlatformSettings",
                columns: table => new
                {
                    Id        = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key       = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value     = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlatformSettings_Key",
                table: "PlatformSettings",
                column: "Key",
                unique: true);

            // Seed the 2Factor.in API key + empty template name (set after DLT approval)
            migrationBuilder.Sql(@$"
INSERT INTO PlatformSettings (Id, [Key], Value, CreatedAt)
VALUES
    ('{Guid.NewGuid()}', 'TwoFactor:ApiKey',      '5b5122b4-4dc0-11f1-9800-0200cd936042', GETUTCDATE()),
    ('{Guid.NewGuid()}', 'TwoFactor:TemplateName', '',                                     GETUTCDATE())
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "PlatformSettings");
        }
    }
}
