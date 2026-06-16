using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Adds payment configuration columns to ChatbotClients and a ChatbotOrders table
    /// so chatbot orders are persisted (with order numbers) and visible in the admin panel.
    /// Hand-written idempotent SQL to match the existing migration style.
    /// The [Migration] attribute is declared inline (no Designer file) so the runtime
    /// MigrateAsync() at startup discovers and applies it automatically.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260616044923_AddChatbotOrdersAndPayments")]
    public partial class AddChatbotOrdersAndPayments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Payment config on ChatbotClients ──────────────────────────────
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CodEnabled' AND Object_ID = Object_ID(N'dbo.ChatbotClients'))
                BEGIN
                    ALTER TABLE [dbo].[ChatbotClients]
                        ADD [CodEnabled]        bit            NOT NULL CONSTRAINT [DF_ChatbotClients_CodEnabled] DEFAULT(1),
                            [OnlineEnabled]     bit            NOT NULL CONSTRAINT [DF_ChatbotClients_OnlineEnabled] DEFAULT(0),
                            [RazorpayKeyId]     nvarchar(200)  NULL,
                            [RazorpayKeySecret] nvarchar(200)  NULL;
                END
            ");

            // ── ChatbotOrders table ───────────────────────────────────────────
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotOrders' AND schema_id = SCHEMA_ID(N'dbo'))
                BEGIN
                    CREATE TABLE [dbo].[ChatbotOrders] (
                        [Id]                uniqueidentifier NOT NULL,
                        [ClientId]          uniqueidentifier NOT NULL,
                        [OrderNumber]       nvarchar(50)     NOT NULL,
                        [SessionId]         nvarchar(200)    NULL,
                        [CustomerName]      nvarchar(200)    NULL,
                        [CustomerPhone]     nvarchar(50)     NULL,
                        [DeliveryAddress]   nvarchar(max)    NULL,
                        [ItemsJson]         nvarchar(max)    NOT NULL,
                        [Total]             decimal(18,2)    NOT NULL,
                        [Currency]          nvarchar(10)     NOT NULL,
                        [PaymentMethod]     nvarchar(20)     NOT NULL,
                        [PaymentStatus]     nvarchar(20)     NOT NULL,
                        [OrderStatus]       nvarchar(20)     NOT NULL,
                        [RazorpayOrderId]   nvarchar(100)    NULL,
                        [RazorpayPaymentId] nvarchar(100)    NULL,
                        [CreatedAt]         datetime2        NOT NULL,
                        [CreatedBy]         uniqueidentifier NULL,
                        [UpdatedAt]         datetime2        NULL,
                        [UpdatedBy]         uniqueidentifier NULL,
                        CONSTRAINT [PK_ChatbotOrders] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_ChatbotOrders_ChatbotClients_ClientId] FOREIGN KEY ([ClientId])
                            REFERENCES [dbo].[ChatbotClients] ([Id]) ON DELETE CASCADE
                    );
                    CREATE INDEX [IX_ChatbotOrders_ClientId] ON [dbo].[ChatbotOrders] ([ClientId]);
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotOrders' AND schema_id = SCHEMA_ID(N'dbo'))
                    DROP TABLE [dbo].[ChatbotOrders];
            ");
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CodEnabled' AND Object_ID = Object_ID(N'dbo.ChatbotClients'))
                BEGIN
                    ALTER TABLE [dbo].[ChatbotClients] DROP CONSTRAINT IF EXISTS [DF_ChatbotClients_CodEnabled];
                    ALTER TABLE [dbo].[ChatbotClients] DROP CONSTRAINT IF EXISTS [DF_ChatbotClients_OnlineEnabled];
                    ALTER TABLE [dbo].[ChatbotClients]
                        DROP COLUMN IF EXISTS [CodEnabled],
                        DROP COLUMN IF EXISTS [OnlineEnabled],
                        DROP COLUMN IF EXISTS [RazorpayKeyId],
                        DROP COLUMN IF EXISTS [RazorpayKeySecret];
                END
            ");
        }
    }
}
