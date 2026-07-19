using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260719000001_AddSubCategorySupport")]
    public partial class AddSubCategorySupport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.Categories', N'ParentCategoryId') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[Categories] ADD [ParentCategoryId] uniqueidentifier NULL;
                END
            ");
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.Categories', N'IsFeatured') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[Categories] ADD [IsFeatured] bit NOT NULL DEFAULT 0;
                END
            ");
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Categories_ParentCategoryId' AND object_id = OBJECT_ID(N'dbo.Categories'))
                BEGIN
                    CREATE INDEX [IX_Categories_ParentCategoryId] ON [dbo].[Categories] ([ParentCategoryId]);
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Categories_ParentCategoryId' AND object_id = OBJECT_ID(N'dbo.Categories'))
                    DROP INDEX [IX_Categories_ParentCategoryId] ON [dbo].[Categories];
            ");
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.Categories', N'IsFeatured') IS NOT NULL
                    ALTER TABLE [dbo].[Categories] DROP COLUMN [IsFeatured];
            ");
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.Categories', N'ParentCategoryId') IS NOT NULL
                    ALTER TABLE [dbo].[Categories] DROP COLUMN [ParentCategoryId];
            ");
        }
    }
}
