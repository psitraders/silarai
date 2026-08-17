using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Realigns AppDbContextModelSnapshot.cs with the live model.
    ///
    /// The snapshot had gone stale because every migration from 20260529000001 onwards was
    /// hand-written idempotent SQL rather than scaffolded (see context.md §4.6), so the
    /// scaffolder emitted a diff re-creating 8 tables and 4 columns that those migrations
    /// already create. Re-creating them here would break a fresh install and is a no-op on
    /// any existing database, so the generated Up() has been reduced to the two objects that
    /// genuinely exist in the model but in no migration:
    ///
    ///   IX_ChatbotProducts_ClientId                — index behind the per-client product lookups
    ///   FK_Categories_Categories_ParentCategoryId  — self-reference added with sub-category support
    ///
    /// The accompanying .Designer.cs and AppDbContextModelSnapshot.cs are the scaffolder's
    /// output, unmodified — they are what makes future `dotnet ef migrations add` produce a
    /// correct diff. Raw idempotent SQL matches the convention of the surrounding migrations.
    /// </summary>
    public partial class SyncModelSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChatbotProducts_ClientId' AND object_id = OBJECT_ID(N'dbo.ChatbotProducts'))
                BEGIN
                    CREATE INDEX [IX_ChatbotProducts_ClientId] ON [dbo].[ChatbotProducts] ([ClientId]);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Categories_ParentCategoryId' AND object_id = OBJECT_ID(N'dbo.Categories'))
                BEGIN
                    CREATE INDEX [IX_Categories_ParentCategoryId] ON [dbo].[Categories] ([ParentCategoryId]);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Categories_Categories_ParentCategoryId')
                BEGIN
                    ALTER TABLE [dbo].[Categories] WITH CHECK
                        ADD CONSTRAINT [FK_Categories_Categories_ParentCategoryId]
                        FOREIGN KEY ([ParentCategoryId]) REFERENCES [dbo].[Categories] ([Id]);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Categories_Categories_ParentCategoryId')
                    ALTER TABLE [dbo].[Categories] DROP CONSTRAINT [FK_Categories_Categories_ParentCategoryId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChatbotProducts_ClientId' AND object_id = OBJECT_ID(N'dbo.ChatbotProducts'))
                    DROP INDEX [IX_ChatbotProducts_ClientId] ON [dbo].[ChatbotProducts];
            ");
        }
    }
}
