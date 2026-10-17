using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Coupons.ShowOnStorefront — lets a merchant list a coupon in the storefront
    /// coupon strip (storefront builder Phase 3 follow-up). Defaults to 0 so existing
    /// coupons stay private. Idempotent raw SQL with an inline [Migration] attribute.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20261016120000_AddCouponShowOnStorefront")]
    public partial class AddCouponShowOnStorefront : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.Coupons', N'ShowOnStorefront') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[Coupons]
                        ADD [ShowOnStorefront] bit NOT NULL CONSTRAINT [DF_Coupons_ShowOnStorefront] DEFAULT 0;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.Coupons', N'ShowOnStorefront') IS NOT NULL
                BEGIN
                    ALTER TABLE [dbo].[Coupons] DROP CONSTRAINT [DF_Coupons_ShowOnStorefront];
                    ALTER TABLE [dbo].[Coupons] DROP COLUMN [ShowOnStorefront];
                END
            ");
        }
    }
}
