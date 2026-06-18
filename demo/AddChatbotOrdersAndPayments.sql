-- ============================================================================
--  ReplyCart / Silarai — Chatbot Orders + Payments
--  Manual schema migration (idempotent — safe to re-run)
--  Mirrors EF migration 20260616044923_AddChatbotOrdersAndPayments
-- ============================================================================

-- ── 1. Payment config columns on ChatbotClients ────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE Name = N'CodEnabled' AND Object_ID = Object_ID(N'dbo.ChatbotClients'))
BEGIN
    ALTER TABLE [dbo].[ChatbotClients]
        ADD [CodEnabled]        bit            NOT NULL CONSTRAINT [DF_ChatbotClients_CodEnabled]    DEFAULT(1),
            [OnlineEnabled]     bit            NOT NULL CONSTRAINT [DF_ChatbotClients_OnlineEnabled] DEFAULT(0),
            [RazorpayKeyId]     nvarchar(200)  NULL,
            [RazorpayKeySecret] nvarchar(200)  NULL;
END
GO

-- ── 2. ChatbotOrders table ──────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables
               WHERE Name = N'ChatbotOrders' AND schema_id = SCHEMA_ID(N'dbo'))
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
GO

-- ── 3. Mark migration as applied so MigrateAsync() skips it ─────────────────
--     (Only needed if your app applies EF migrations at startup.)
IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory]
               WHERE [MigrationId] = N'20260616044923_AddChatbotOrdersAndPayments')
BEGIN
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260616044923_AddChatbotOrdersAndPayments', N'8.0.22');
END
GO
