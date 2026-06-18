-- ============================================================================
--  Silarai — Chatbot Knowledge Base documents
--  Manual schema migration (idempotent — safe to re-run)
--  Mirrors EF migration 20260617000000_AddChatbotDocuments
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables
               WHERE Name = N'ChatbotDocuments' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE [dbo].[ChatbotDocuments] (
        [Id]            uniqueidentifier NOT NULL,
        [ClientId]      uniqueidentifier NOT NULL,
        [FileName]      nvarchar(300)    NOT NULL,
        [ContentType]   nvarchar(150)    NOT NULL,
        [SizeBytes]     bigint           NOT NULL,
        [CharCount]     int              NOT NULL,
        [ExtractedText] nvarchar(max)    NOT NULL,
        [CreatedAt]     datetime2        NOT NULL,
        [CreatedBy]     uniqueidentifier NULL,
        [UpdatedAt]     datetime2        NULL,
        [UpdatedBy]     uniqueidentifier NULL,
        CONSTRAINT [PK_ChatbotDocuments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ChatbotDocuments_ChatbotClients_ClientId] FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[ChatbotClients] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_ChatbotDocuments_ClientId] ON [dbo].[ChatbotDocuments] ([ClientId]);
END
GO

-- Mark migration applied so startup MigrateAsync() skips it
IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory]
               WHERE [MigrationId] = N'20260617000000_AddChatbotDocuments')
BEGIN
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260617000000_AddChatbotDocuments', N'8.0.22');
END
GO
