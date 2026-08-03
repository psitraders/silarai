using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFaviconAndLoaderToStorefrontSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // NOTE: Users.IsTwoFactorEnabled / Users.TotpSecret are already added by
            // 20260508120000_AddAuthProductionFlows — removed here to avoid a duplicate-column error.
            migrationBuilder.AddColumn<string>(
                name: "CloudflareHostnameId",
                table: "Tenants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CloudflareWorkerRouteId",
                table: "Tenants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CloudflareZoneId",
                table: "Tenants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomDomain",
                table: "Tenants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomDomainStatus",
                table: "Tenants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CustomDomainVerifiedAt",
                table: "Tenants",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SecondaryColor",
                table: "StorefrontSettings",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "#134E4A");

            migrationBuilder.AlterColumn<string>(
                name: "GA4PropertyId",
                table: "StorefrontSettings",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "GA4MeasurementId",
                table: "StorefrontSettings",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AccentColor",
                table: "StorefrontSettings",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FaviconUrl",
                table: "StorefrontSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GA4RefreshToken",
                table: "StorefrontSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GA4ServiceAccountJson",
                table: "StorefrontSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LoaderEnabled",
                table: "StorefrontSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Anniversary",
                table: "Customers",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Birthday",
                table: "Customers",
                type: "date",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Language",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldDefaultValue: "en");

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldDefaultValue: "India");

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

            migrationBuilder.AddColumn<bool>(
                name: "AutoReplyEnabled",
                table: "Businesses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AutoReplyTone",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PayPalClientId",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayPalClientSecret",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PayPalSandbox",
                table: "Businesses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentGateway",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StripeSecretKey",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppCatalogId",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            // NOTE: AbandonedCarts is already created by 20260507120000_AddCouponsReviewsAbandonedCarts —
            // removed here to avoid a duplicate-table error.

            migrationBuilder.CreateTable(
                name: "AutoCampaigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeneratedCaption = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeneratedHashtags = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeneratedCta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeneratedImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostedToInstagram = table.Column<bool>(type: "bit", nullable: false),
                    InstagramPostId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostedToFacebook = table.Column<bool>(type: "bit", nullable: false),
                    FacebookPostId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SentViaWhatsAppBroadcast = table.Column<bool>(type: "bit", nullable: false),
                    WhatsAppRecipientsCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ErrorLog = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutoCampaigns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConversationSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExternalCustomerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Channel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    State = table.Column<int>(type: "int", nullable: false),
                    CollectedName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CollectedPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CollectedAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CollectedEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InterestedProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CartJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MessagesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastMessageAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MessageCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationSessions", x => x.Id);
                });

            // NOTE: Coupons is already created by 20260507120000_AddCouponsReviewsAbandonedCarts and
            // LandingPageConfigs by 20260508000000_AddLandingPageConfig — removed here to avoid
            // duplicate-table errors.

            migrationBuilder.CreateTable(
                name: "PlatformSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformSettings", x => x.Id);
                });

            // NOTE: ProductReviews is already created by 20260507120000_AddCouponsReviewsAbandonedCarts
            // and UserTokens by 20260508120000_AddAuthProductionFlows (including their indexes/FKs) —
            // removed here to avoid duplicate-table errors.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AutoCampaigns");

            migrationBuilder.DropTable(
                name: "ConversationSessions");

            migrationBuilder.DropTable(
                name: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "CloudflareHostnameId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "CloudflareWorkerRouteId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "CloudflareZoneId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "CustomDomain",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "CustomDomainStatus",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "CustomDomainVerifiedAt",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "FaviconUrl",
                table: "StorefrontSettings");

            migrationBuilder.DropColumn(
                name: "GA4RefreshToken",
                table: "StorefrontSettings");

            migrationBuilder.DropColumn(
                name: "GA4ServiceAccountJson",
                table: "StorefrontSettings");

            migrationBuilder.DropColumn(
                name: "LoaderEnabled",
                table: "StorefrontSettings");

            migrationBuilder.DropColumn(
                name: "Anniversary",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Birthday",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "AiStoreContext",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "AutoCampaignEnabled",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "AutoReplyEnabled",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "AutoReplyTone",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "PayPalClientId",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "PayPalClientSecret",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "PayPalSandbox",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "PaymentGateway",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "StripeSecretKey",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "WhatsAppCatalogId",
                table: "Businesses");

            migrationBuilder.AlterColumn<string>(
                name: "SecondaryColor",
                table: "StorefrontSettings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "#134E4A",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "GA4PropertyId",
                table: "StorefrontSettings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "GA4MeasurementId",
                table: "StorefrontSettings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AccentColor",
                table: "StorefrontSettings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Language",
                table: "Businesses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "en",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "Businesses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "India",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
