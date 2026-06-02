using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformLeads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // MetaStatus + MetaTemplateId already added by AddMetaTemplateFields — skip.

            // Add Slug to Products only if it doesn't already exist (idempotent)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE Name = N'Slug'
                      AND Object_ID = Object_ID(N'dbo.Products')
                )
                BEGIN
                    ALTER TABLE [dbo].[Products] ADD [Slug] nvarchar(max) NULL;
                END
            ");

            // Create PlatformLeads table only if it doesn't already exist (idempotent)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'PlatformLeads')
                BEGIN
                    CREATE TABLE [dbo].[PlatformLeads] (
                        [Id]           uniqueidentifier  NOT NULL DEFAULT NEWID(),
                        [Name]         nvarchar(max)     NOT NULL,
                        [Email]        nvarchar(max)     NOT NULL,
                        [Phone]        nvarchar(max)     NULL,
                        [BusinessType] nvarchar(max)     NULL,
                        [ProductCount] nvarchar(max)     NULL,
                        [Message]      nvarchar(max)     NULL,
                        [Source]       nvarchar(max)     NOT NULL DEFAULT N'chatbot',
                        [Status]       nvarchar(max)     NOT NULL DEFAULT N'new',
                        [AdminNotes]   nvarchar(max)     NULL,
                        [IpAddress]    nvarchar(max)     NULL,
                        [UtmSource]    nvarchar(max)     NULL,
                        [UtmMedium]    nvarchar(max)     NULL,
                        [UtmCampaign]  nvarchar(max)     NULL,
                        [CreatedAt]    datetime2         NOT NULL DEFAULT SYSUTCDATETIME(),
                        [CreatedBy]    uniqueidentifier  NULL,
                        [UpdatedAt]    datetime2         NULL,
                        [UpdatedBy]    uniqueidentifier  NULL,
                        CONSTRAINT [PK_PlatformLeads] PRIMARY KEY ([Id])
                    );
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlatformLeads");

            // MetaStatus + MetaTemplateId owned by AddMetaTemplateFields — not dropped here.

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Products");
        }
    }
}
