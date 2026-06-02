using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations
{
    public partial class AddPaymentGatewayFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentGateway",
                table: "Businesses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Razorpay");

            migrationBuilder.AddColumn<string>(
                name: "StripeSecretKey",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

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
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "PaymentGateway",    table: "Businesses");
            migrationBuilder.DropColumn(name: "StripeSecretKey",   table: "Businesses");
            migrationBuilder.DropColumn(name: "PayPalClientId",    table: "Businesses");
            migrationBuilder.DropColumn(name: "PayPalClientSecret",table: "Businesses");
            migrationBuilder.DropColumn(name: "PayPalSandbox",     table: "Businesses");
        }
    }
}
