using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260531000001_AddStorefrontPages")]
    public partial class AddStorefrontPages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'StorefrontPages')
                BEGIN
                    CREATE TABLE [dbo].[StorefrontPages] (
                        [Id]           uniqueidentifier NOT NULL DEFAULT NEWID(),
                        [TenantId]     uniqueidentifier NOT NULL,
                        [Title]        nvarchar(200)    NOT NULL,
                        [Slug]         nvarchar(200)    NOT NULL,
                        [Content]      nvarchar(max)    NOT NULL DEFAULT N'',
                        [IsPublished]  bit              NOT NULL DEFAULT 1,
                        [ShowInNav]    bit              NOT NULL DEFAULT 0,
                        [ShowInFooter] bit              NOT NULL DEFAULT 0,
                        [SortOrder]    int              NOT NULL DEFAULT 0,
                        [CreatedAt]    datetime2        NOT NULL DEFAULT SYSUTCDATETIME(),
                        [CreatedBy]    uniqueidentifier NULL,
                        [UpdatedAt]    datetime2        NULL,
                        [UpdatedBy]    uniqueidentifier NULL,
                        CONSTRAINT [PK_StorefrontPages] PRIMARY KEY ([Id]),
                        CONSTRAINT [UQ_StorefrontPages_TenantSlug] UNIQUE ([TenantId], [Slug])
                    );
                    CREATE INDEX [IX_StorefrontPages_TenantId] ON [dbo].[StorefrontPages] ([TenantId]);
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS [dbo].[StorefrontPages]");
        }
    }
}
