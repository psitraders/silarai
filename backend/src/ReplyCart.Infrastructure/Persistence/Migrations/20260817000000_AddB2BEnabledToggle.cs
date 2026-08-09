using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// StorefrontSettings.B2BEnabled — per-tenant toggle for B2B storefront
    /// features (business-buyer signup, wholesale tiers, quote requests).
    /// Defaults to 1 so existing tenants keep current behaviour.
    /// Idempotent raw SQL with an inline [Migration] attribute.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260817000000_AddB2BEnabledToggle")]
    public partial class AddB2BEnabledToggle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.StorefrontSettings', N'B2BEnabled') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[StorefrontSettings]
                        ADD [B2BEnabled] bit NOT NULL CONSTRAINT [DF_StorefrontSettings_B2BEnabled] DEFAULT 1;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.StorefrontSettings', N'B2BEnabled') IS NOT NULL
                BEGIN
                    ALTER TABLE [dbo].[StorefrontSettings] DROP CONSTRAINT [DF_StorefrontSettings_B2BEnabled];
                    ALTER TABLE [dbo].[StorefrontSettings] DROP COLUMN [B2BEnabled];
                END
            ");
        }
    }
}
