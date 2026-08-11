using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260719000000_AddSubCategoriesEnabled")]
    public partial class AddSubCategoriesEnabled : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.StorefrontSettings', N'SubCategoriesEnabled') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[StorefrontSettings] ADD [SubCategoriesEnabled] bit NOT NULL DEFAULT 0;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.StorefrontSettings', N'SubCategoriesEnabled') IS NOT NULL
                    ALTER TABLE [dbo].[StorefrontSettings] DROP COLUMN [SubCategoriesEnabled];
            ");
        }
    }
}
