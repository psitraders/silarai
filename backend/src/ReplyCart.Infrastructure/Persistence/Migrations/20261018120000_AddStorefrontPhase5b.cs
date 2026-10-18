using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Storefront builder Phase 5b — StorefrontPages.AssignmentJson (alternate product templates:
    /// assigned category / product ids) and StorefrontThemes.PreviewToken (shareable draft preview
    /// link). Both nullable. Idempotent raw SQL with an inline [Migration] attribute.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20261018120000_AddStorefrontPhase5b")]
    public partial class AddStorefrontPhase5b : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.StorefrontPages', N'AssignmentJson') IS NULL
                    ALTER TABLE [dbo].[StorefrontPages] ADD [AssignmentJson] nvarchar(max) NULL;

                IF COL_LENGTH(N'dbo.StorefrontThemes', N'PreviewToken') IS NULL
                    ALTER TABLE [dbo].[StorefrontThemes] ADD [PreviewToken] nvarchar(64) NULL;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.StorefrontPages', N'AssignmentJson') IS NOT NULL
                    ALTER TABLE [dbo].[StorefrontPages] DROP COLUMN [AssignmentJson];

                IF COL_LENGTH(N'dbo.StorefrontThemes', N'PreviewToken') IS NOT NULL
                    ALTER TABLE [dbo].[StorefrontThemes] DROP COLUMN [PreviewToken];
            ");
        }
    }
}
