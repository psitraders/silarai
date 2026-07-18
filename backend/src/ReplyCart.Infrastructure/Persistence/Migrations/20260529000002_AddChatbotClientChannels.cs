using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ReplyCart.Infrastructure.Persistence;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260529000002_AddChatbotClientChannels")]
    public partial class AddChatbotClientChannels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'WaPhoneNumberId' AND Object_ID = Object_ID(N'dbo.ChatbotClients'))
                BEGIN
                    ALTER TABLE [dbo].[ChatbotClients]
                        ADD [WaPhoneNumberId]   nvarchar(100) NULL,
                            [WaAccessToken]     nvarchar(max) NULL,
                            [WaPhoneNumber]     nvarchar(50)  NULL,
                            [WaBusinessId]      nvarchar(100) NULL,
                            [FbPageId]          nvarchar(100) NULL,
                            [FbPageAccessToken] nvarchar(max) NULL,
                            [IgAccountId]       nvarchar(100) NULL,
                            [IgAccessToken]     nvarchar(max) NULL,
                            [ShopifyDomain]     nvarchar(200) NULL,
                            [ShopifyApiKey]     nvarchar(200) NULL,
                            [LastShopifySync]   datetime2     NULL;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE [dbo].[ChatbotClients]
                    DROP COLUMN IF EXISTS [WaPhoneNumberId],
                    DROP COLUMN IF EXISTS [WaAccessToken],
                    DROP COLUMN IF EXISTS [WaPhoneNumber],
                    DROP COLUMN IF EXISTS [WaBusinessId],
                    DROP COLUMN IF EXISTS [FbPageId],
                    DROP COLUMN IF EXISTS [FbPageAccessToken],
                    DROP COLUMN IF EXISTS [IgAccountId],
                    DROP COLUMN IF EXISTS [IgAccessToken],
                    DROP COLUMN IF EXISTS [ShopifyDomain],
                    DROP COLUMN IF EXISTS [ShopifyApiKey],
                    DROP COLUMN IF EXISTS [LastShopifySync];
            ");
        }
    }
}
