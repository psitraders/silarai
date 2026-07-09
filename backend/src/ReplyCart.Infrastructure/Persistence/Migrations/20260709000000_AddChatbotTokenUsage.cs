using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// 1. ChatbotClients.TenantId — chatbot clients become tenant-owned (null = admin/platform).
    /// 2. ChatbotTokenUsages — one row per AI call, powering tenant + admin token reports.
    /// Idempotent raw SQL with an inline [Migration] attribute so the startup
    /// MigrateAsync() discovers and applies it.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260709000000_AddChatbotTokenUsage")]
    public partial class AddChatbotTokenUsage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.ChatbotClients', N'TenantId') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[ChatbotClients] ADD [TenantId] uniqueidentifier NULL;
                END
            ");
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChatbotClients_TenantId' AND object_id = OBJECT_ID(N'dbo.ChatbotClients'))
                BEGIN
                    CREATE INDEX [IX_ChatbotClients_TenantId] ON [dbo].[ChatbotClients] ([TenantId]);
                END
            ");
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotTokenUsages' AND schema_id = SCHEMA_ID(N'dbo'))
                BEGIN
                    CREATE TABLE [dbo].[ChatbotTokenUsages] (
                        [Id]               uniqueidentifier NOT NULL,
                        [ClientId]         uniqueidentifier NOT NULL,
                        [TenantId]         uniqueidentifier NULL,
                        [Channel]          nvarchar(30)     NOT NULL,
                        [PromptTokens]     int              NOT NULL,
                        [CompletionTokens] int              NOT NULL,
                        [CreatedAt]        datetime2        NOT NULL,
                        [CreatedBy]        uniqueidentifier NULL,
                        [UpdatedAt]        datetime2        NULL,
                        [UpdatedBy]        uniqueidentifier NULL,
                        CONSTRAINT [PK_ChatbotTokenUsages] PRIMARY KEY ([Id])
                    );
                    CREATE INDEX [IX_ChatbotTokenUsages_ClientId_CreatedAt] ON [dbo].[ChatbotTokenUsages] ([ClientId], [CreatedAt]);
                    CREATE INDEX [IX_ChatbotTokenUsages_TenantId_CreatedAt] ON [dbo].[ChatbotTokenUsages] ([TenantId], [CreatedAt]);
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotTokenUsages' AND schema_id = SCHEMA_ID(N'dbo'))
                    DROP TABLE [dbo].[ChatbotTokenUsages];
            ");
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChatbotClients_TenantId' AND object_id = OBJECT_ID(N'dbo.ChatbotClients'))
                    DROP INDEX [IX_ChatbotClients_TenantId] ON [dbo].[ChatbotClients];
            ");
            migrationBuilder.Sql(@"
                IF COL_LENGTH(N'dbo.ChatbotClients', N'TenantId') IS NOT NULL
                    ALTER TABLE [dbo].[ChatbotClients] DROP COLUMN [TenantId];
            ");
        }
    }
}
