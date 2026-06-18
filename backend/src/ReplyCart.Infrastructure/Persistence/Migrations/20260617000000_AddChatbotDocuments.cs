using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Knowledge-base documents per chatbot client. Idempotent raw SQL with an inline
    /// [Migration] attribute so the startup MigrateAsync() discovers and applies it.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260617000000_AddChatbotDocuments")]
    public partial class AddChatbotDocuments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotDocuments' AND schema_id = SCHEMA_ID(N'dbo'))
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
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.tables WHERE Name = N'ChatbotDocuments' AND schema_id = SCHEMA_ID(N'dbo'))
                    DROP TABLE [dbo].[ChatbotDocuments];
            ");
        }
    }
}
