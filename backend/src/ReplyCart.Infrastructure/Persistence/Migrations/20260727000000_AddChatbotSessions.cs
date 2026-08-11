using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Durable tier for chatbot-client conversations:
    ///   ChatbotSessions         one row per (client, buyer session) — collected fields + cart JSON
    ///   ChatbotSessionMessages  the transcript
    ///
    /// Backs the Redis session store: when Redis is unavailable and the request lands
    /// on an instance with no local copy, the conversation is rebuilt from here.
    ///
    /// Hand-written idempotent raw SQL with an inline [Migration] attribute, matching
    /// AddChatbotDocuments / AddChatbotTokenUsage. Deliberately NOT scaffolded via
    /// `dotnet ef migrations add` — AppDbContextModelSnapshot.cs is stale (see
    /// context.md §4.6) and scaffolding would emit a diff that breaks a fresh install.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260727000000_AddChatbotSessions")]
    public partial class AddChatbotSessions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotSessions' AND schema_id = SCHEMA_ID(N'dbo'))
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
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotSessionMessages' AND schema_id = SCHEMA_ID(N'dbo'))
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
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotSessionMessages' AND schema_id = SCHEMA_ID(N'dbo'))
                    DROP TABLE [dbo].[ChatbotSessionMessages];
            ");
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotSessions' AND schema_id = SCHEMA_ID(N'dbo'))
                    DROP TABLE [dbo].[ChatbotSessions];
            ");
        }
    }
}
