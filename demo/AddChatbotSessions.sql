-- ============================================================================
--  Silarai — Chatbot conversation durability tier
--  Manual schema migration (idempotent — safe to re-run)
--  Mirrors EF migration 20260727000000_AddChatbotSessions
--
--  1. ChatbotSessions         one row per (chatbot client, buyer session):
--                             collected name/phone/address/payment + the
--                             server-authoritative cart as JSON
--  2. ChatbotSessionMessages  the conversation transcript
--
--  Redis (Azure Managed Redis) is the hot store for live sessions. These tables
--  are the backstop: if Redis is unreachable and the request lands on an
--  instance that has never seen the session, the conversation is rebuilt from
--  here instead of the buyer starting over mid-checkout.
--
--  Rows are written by a background worker, never on the request path.
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables
               WHERE Name = N'ChatbotSessions' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE [dbo].[ChatbotSessions] (
        [Id]              uniqueidentifier NOT NULL,
        [ClientId]        uniqueidentifier NOT NULL,
        [SessionId]       nvarchar(128)    NOT NULL,
        [Channel]         nvarchar(30)     NOT NULL,
        [State]           nvarchar(40)     NULL,
        [CustomerName]    nvarchar(200)    NULL,
        [CustomerPhone]   nvarchar(40)     NULL,
        [DeliveryAddress] nvarchar(1000)   NULL,
        [PaymentMethod]   nvarchar(20)     NULL,
        [CartJson]        nvarchar(max)    NOT NULL,
        [LastMessageAt]   datetime2        NOT NULL,
        [MessageSeq]      int              NOT NULL,
        [CreatedAt]       datetime2        NOT NULL,
        [CreatedBy]       uniqueidentifier NULL,
        [UpdatedAt]       datetime2        NULL,
        [UpdatedBy]       uniqueidentifier NULL,
        CONSTRAINT [PK_ChatbotSessions] PRIMARY KEY ([Id])
    );

    CREATE UNIQUE INDEX [IX_ChatbotSessions_ClientId_SessionId]
        ON [dbo].[ChatbotSessions] ([ClientId], [SessionId]);

    CREATE INDEX [IX_ChatbotSessions_ClientId_LastMessageAt]
        ON [dbo].[ChatbotSessions] ([ClientId], [LastMessageAt]);

    PRINT 'Created dbo.ChatbotSessions';
END
ELSE
    PRINT 'dbo.ChatbotSessions already exists — skipped';
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables
               WHERE Name = N'ChatbotSessionMessages' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE [dbo].[ChatbotSessionMessages] (
        [Id]           uniqueidentifier NOT NULL,
        [SessionRowId] uniqueidentifier NOT NULL,
        [Role]         nvarchar(20)     NOT NULL,
        [Content]      nvarchar(4000)   NOT NULL,
        [Seq]          int              NOT NULL,
        [CreatedAt]    datetime2        NOT NULL,
        [CreatedBy]    uniqueidentifier NULL,
        [UpdatedAt]    datetime2        NULL,
        [UpdatedBy]    uniqueidentifier NULL,
        CONSTRAINT [PK_ChatbotSessionMessages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ChatbotSessionMessages_ChatbotSessions_SessionRowId]
            FOREIGN KEY ([SessionRowId]) REFERENCES [dbo].[ChatbotSessions] ([Id]) ON DELETE CASCADE
    );

    CREATE INDEX [IX_ChatbotSessionMessages_SessionRowId_Seq]
        ON [dbo].[ChatbotSessionMessages] ([SessionRowId], [Seq]);

    PRINT 'Created dbo.ChatbotSessionMessages';
END
ELSE
    PRINT 'dbo.ChatbotSessionMessages already exists — skipped';
GO

-- Register the EF migration so `dotnet ef database update` does not try to
-- re-apply it on a database that was patched with this script.
IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory]
               WHERE [MigrationId] = N'20260727000000_AddChatbotSessions')
BEGIN
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260727000000_AddChatbotSessions', N'8.0.0');
    PRINT 'Recorded migration 20260727000000_AddChatbotSessions';
END
GO
