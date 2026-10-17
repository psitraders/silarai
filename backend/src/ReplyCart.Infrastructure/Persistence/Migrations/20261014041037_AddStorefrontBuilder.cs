using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStorefrontBuilder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "StorefrontPages");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "StorefrontPages",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.Sql(@"
  IF OBJECT_ID('UQ_StorefrontPages_TenantSlug', 'UQ') IS NOT NULL
      ALTER TABLE StorefrontPages DROP CONSTRAINT UQ_StorefrontPages_TenantSlug;
  IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_StorefrontPages_TenantSlug')
      DROP INDEX UQ_StorefrontPages_TenantSlug ON StorefrontPages;");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "StorefrontPages",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "StorefrontPages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "StorefrontPages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DraftLayoutJson",
                table: "StorefrontPages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "StorefrontPages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OgImageUrl",
                table: "StorefrontPages",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PageType",
                table: "StorefrontPages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "StorefrontPages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublishedLayoutJson",
                table: "StorefrontPages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeoDescription",
                table: "StorefrontPages",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeoTitle",
                table: "StorefrontPages",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StorefrontThemes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DraftJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PublishedJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StorefrontThemes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StorefrontPages_TenantId_PageType",
                table: "StorefrontPages",
                columns: new[] { "TenantId", "PageType" });

            migrationBuilder.CreateIndex(
                name: "IX_StorefrontPages_TenantId_Slug",
                table: "StorefrontPages",
                columns: new[] { "TenantId", "Slug" });

            migrationBuilder.CreateIndex(
                name: "IX_StorefrontThemes_TenantId",
                table: "StorefrontThemes",
                column: "TenantId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StorefrontThemes");

            migrationBuilder.DropIndex(
                name: "IX_StorefrontPages_TenantId_PageType",
                table: "StorefrontPages");

            migrationBuilder.DropIndex(
                name: "IX_StorefrontPages_TenantId_Slug",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "DraftLayoutJson",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "OgImageUrl",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "PageType",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "PublishedLayoutJson",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "SeoDescription",
                table: "StorefrontPages");

            migrationBuilder.DropColumn(
                name: "SeoTitle",
                table: "StorefrontPages");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "StorefrontPages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "StorefrontPages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(120)",
                oldMaxLength: 120);

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "StorefrontPages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
