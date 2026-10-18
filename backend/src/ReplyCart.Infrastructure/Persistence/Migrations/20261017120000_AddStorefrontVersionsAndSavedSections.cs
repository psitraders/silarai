using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Storefront builder Phase 5a — StorefrontVersions (snapshot per publish, newest 10 kept)
    /// and StorefrontSavedSections (merchant's reusable sections). Idempotent raw SQL with an
    /// inline [Migration] attribute.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20261017120000_AddStorefrontVersionsAndSavedSections")]
    public partial class AddStorefrontVersionsAndSavedSections : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF OBJECT_ID(N'dbo.StorefrontVersions', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[StorefrontVersions] (
                        [Id] uniqueidentifier NOT NULL,
                        [Version] int NOT NULL,
                        [PublishedAt] datetime2 NOT NULL,
                        [SiteJson] nvarchar(max) NOT NULL,
                        [PagesJson] nvarchar(max) NOT NULL,
                        [PageCount] int NOT NULL,
                        [TenantId] uniqueidentifier NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [CreatedBy] uniqueidentifier NULL,
                        [UpdatedAt] datetime2 NULL,
                        [UpdatedBy] uniqueidentifier NULL,
                        [IsDeleted] bit NOT NULL,
                        [DeletedAt] datetime2 NULL,
                        [DeletedBy] uniqueidentifier NULL,
                        CONSTRAINT [PK_StorefrontVersions] PRIMARY KEY ([Id])
                    );
                END

                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StorefrontVersions_TenantId_PublishedAt' AND object_id = OBJECT_ID(N'dbo.StorefrontVersions'))
                    CREATE INDEX [IX_StorefrontVersions_TenantId_PublishedAt] ON [dbo].[StorefrontVersions] ([TenantId], [PublishedAt]);

                IF OBJECT_ID(N'dbo.StorefrontSavedSections', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[StorefrontSavedSections] (
                        [Id] uniqueidentifier NOT NULL,
                        [Name] nvarchar(100) NOT NULL,
                        [SectionType] nvarchar(60) NOT NULL,
                        [SectionJson] nvarchar(max) NOT NULL,
                        [TenantId] uniqueidentifier NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [CreatedBy] uniqueidentifier NULL,
                        [UpdatedAt] datetime2 NULL,
                        [UpdatedBy] uniqueidentifier NULL,
                        [IsDeleted] bit NOT NULL,
                        [DeletedAt] datetime2 NULL,
                        [DeletedBy] uniqueidentifier NULL,
                        CONSTRAINT [PK_StorefrontSavedSections] PRIMARY KEY ([Id])
                    );
                END

                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StorefrontSavedSections_TenantId' AND object_id = OBJECT_ID(N'dbo.StorefrontSavedSections'))
                    CREATE INDEX [IX_StorefrontSavedSections_TenantId] ON [dbo].[StorefrontSavedSections] ([TenantId]);
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF OBJECT_ID(N'dbo.StorefrontSavedSections', N'U') IS NOT NULL DROP TABLE [dbo].[StorefrontSavedSections];
                IF OBJECT_ID(N'dbo.StorefrontVersions', N'U') IS NOT NULL DROP TABLE [dbo].[StorefrontVersions];
            ");
        }
    }
}
