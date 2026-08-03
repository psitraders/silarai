using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260529000001_AddChatbotClients")]
    public partial class AddChatbotClients : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'ChatbotClients')
                BEGIN
                    CREATE TABLE [dbo].[ChatbotClients] (
                        [Id]             uniqueidentifier NOT NULL DEFAULT NEWID(),
                        [Name]           nvarchar(200)    NOT NULL,
                        [BusinessDesc]   nvarchar(max)    NOT NULL DEFAULT N'',
                        [ApiKey]         nvarchar(100)    NOT NULL,
                        [Currency]       nvarchar(10)     NOT NULL DEFAULT N'INR',
                        [Language]       nvarchar(10)     NOT NULL DEFAULT N'en',
                        [WebhookUrl]     nvarchar(500)    NULL,
                        [ContactEmail]   nvarchar(200)    NULL,
                        [ContactPhone]   nvarchar(50)     NULL,
                        [LogoUrl]        nvarchar(500)    NULL,
                        [WelcomeMessage] nvarchar(500)    NULL,
                        [IsActive]       bit              NOT NULL DEFAULT 1,
                        [CreatedAt]      datetime2        NOT NULL DEFAULT SYSUTCDATETIME(),
                        [CreatedBy]      uniqueidentifier NULL,
                        [UpdatedAt]      datetime2        NULL,
                        [UpdatedBy]      uniqueidentifier NULL,
                        CONSTRAINT [PK_ChatbotClients] PRIMARY KEY ([Id]),
                        CONSTRAINT [UQ_ChatbotClients_ApiKey] UNIQUE ([ApiKey])
                    );
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'ChatbotProducts')
                BEGIN
                    CREATE TABLE [dbo].[ChatbotProducts] (
                        [Id]          uniqueidentifier NOT NULL DEFAULT NEWID(),
                        [ClientId]    uniqueidentifier NOT NULL,
                        [Title]       nvarchar(300)    NOT NULL,
                        [Description] nvarchar(max)    NULL,
                        [Price]       decimal(18,2)    NOT NULL DEFAULT 0,
                        [SalePrice]   decimal(18,2)    NULL,
                        [Variants]    nvarchar(max)    NULL,
                        [ImageUrl]    nvarchar(500)    NULL,
                        [Category]    nvarchar(100)    NULL,
                        [IsAvailable] bit              NOT NULL DEFAULT 1,
                        [CreatedAt]   datetime2        NOT NULL DEFAULT SYSUTCDATETIME(),
                        [CreatedBy]   uniqueidentifier NULL,
                        [UpdatedAt]   datetime2        NULL,
                        [UpdatedBy]   uniqueidentifier NULL,
                        CONSTRAINT [PK_ChatbotProducts] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_ChatbotProducts_ChatbotClients]
                            FOREIGN KEY ([ClientId]) REFERENCES [ChatbotClients]([Id]) ON DELETE CASCADE
                    );
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS [dbo].[ChatbotProducts]");
            migrationBuilder.Sql("DROP TABLE IF EXISTS [dbo].[ChatbotClients]");
        }
    }
}
