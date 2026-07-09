-- ============================================================================
--  Silarai — Chatbot tenant ownership + token usage tracking
--  Manual schema migration (idempotent — safe to re-run)
--  Mirrors EF migration 20260709000000_AddChatbotTokenUsage
--
--  1. ChatbotClients.TenantId  — chatbot clients become tenant-owned
--                                 (NULL = platform/admin-owned client)
--  2. ChatbotTokenUsages       — one row per AI call, powers the tenant
--                                 Token Usage screen and the admin
--                                 per-tenant consumption report
-- ============================================================================

-- 1. Add TenantId to ChatbotClients
IF COL_LENGTH(N'dbo.ChatbotClients', N'TenantId') IS NULL
BEGIN
    ALTER TABLE [dbo].[ChatbotClients] ADD [TenantId] uniqueidentifier NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = N'IX_ChatbotClients_TenantId'
                 AND object_id = OBJECT_ID(N'dbo.ChatbotClients'))
BEGIN
    CREATE INDEX [IX_ChatbotClients_TenantId] ON [dbo].[ChatbotClients] ([TenantId]);
END
GO

-- 2. Create ChatbotTokenUsages
IF NOT EXISTS (SELECT 1 FROM sys.tables
               WHERE Name = N'ChatbotTokenUsages' AND schema_id = SCHEMA_ID(N'dbo'))
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
GO

-- Mark migration applied so a future startup MigrateAsync() skips it
IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory]
               WHERE [MigrationId] = N'20260709000000_AddChatbotTokenUsage')
BEGIN
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260709000000_AddChatbotTokenUsage', N'8.0.22');
END
GO

-- ============================================================================
--  OPTIONAL: assign an existing platform client to a tenant so that tenant
--  can see and manage it from their dashboard. Fill in both GUIDs and unquote.
-- ============================================================================
-- UPDATE [dbo].[ChatbotClients]
-- SET    [TenantId] = '<tenant-guid-here>'
-- WHERE  [Id]       = '<chatbot-client-guid-here>';
