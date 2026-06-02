using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAutonomousAi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── AutoCampaigns ──────────────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "AutoCampaigns",
                columns: table => new
                {
                    Id                      = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId               = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductName             = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    GeneratedCaption        = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                    GeneratedHashtags       = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false, defaultValue: ""),
                    GeneratedCta            = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false, defaultValue: ""),
                    GeneratedImageUrl       = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PostedToInstagram       = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    InstagramPostId         = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostedToFacebook        = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    FacebookPostId          = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SentViaWhatsAppBroadcast = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    WhatsAppRecipientsCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Status                  = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ErrorLog                = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletedAt             = table.Column<DateTime>(type: "datetime2", nullable: true),
                    // TenantEntity base
                    TenantId    = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted   = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt   = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy   = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt   = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy   = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutoCampaigns", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AutoCampaigns_TenantId",
                table: "AutoCampaigns",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AutoCampaigns_ProductId",
                table: "AutoCampaigns",
                column: "ProductId");

            // ── ConversationSessions ───────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "ConversationSessions",
                columns: table => new
                {
                    Id                  = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExternalCustomerId  = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Channel             = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "WhatsApp"),
                    State               = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CollectedName       = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CollectedPhone      = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CollectedAddress    = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CollectedEmail      = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InterestedProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CartJson            = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                    MessagesJson        = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                    LastMessageAt       = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive            = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    LeadId              = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderId             = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MessageCount        = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    // TenantEntity base
                    TenantId  = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationSessions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConversationSessions_TenantId",
                table: "ConversationSessions",
                column: "TenantId");

            // Index for fast active-session lookup per customer per channel
            migrationBuilder.CreateIndex(
                name: "IX_ConversationSessions_TenantId_ExternalCustomerId_Channel_IsActive",
                table: "ConversationSessions",
                columns: ["TenantId", "ExternalCustomerId", "Channel", "IsActive"]);

            // ── Business: add autonomous AI toggle columns ─────────────────────
            migrationBuilder.AddColumn<bool>(
                name: "AutoReplyEnabled",
                table: "Businesses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AutoReplyTone",
                table: "Businesses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Friendly");

            migrationBuilder.AddColumn<string>(
                name: "AiStoreContext",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AutoCampaignEnabled",
                table: "Businesses",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "AutoCampaigns");
            migrationBuilder.DropTable(name: "ConversationSessions");

            migrationBuilder.DropColumn(name: "AutoReplyEnabled",    table: "Businesses");
            migrationBuilder.DropColumn(name: "AutoReplyTone",       table: "Businesses");
            migrationBuilder.DropColumn(name: "AiStoreContext",      table: "Businesses");
            migrationBuilder.DropColumn(name: "AutoCampaignEnabled", table: "Businesses");
        }
    }
}
