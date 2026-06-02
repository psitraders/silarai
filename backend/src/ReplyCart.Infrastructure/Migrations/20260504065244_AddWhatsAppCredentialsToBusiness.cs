using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppCredentialsToBusiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WhatsAppAccessToken",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppPhoneNumberId",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WhatsAppAccessToken",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "WhatsAppPhoneNumberId",
                table: "Businesses");
        }
    }
}
