using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMetaWhatsApp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add WhatsApp Business Account ID for Meta Cloud API
            migrationBuilder.AddColumn<string>(
                name: "WhatsAppWabaId",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            // Remove AiSensy API key (no longer used — replaced by Meta Embedded Signup)
            migrationBuilder.DropColumn(
                name: "AiSensyApiKey",
                table: "Businesses");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WhatsAppWabaId",
                table: "Businesses");

            migrationBuilder.AddColumn<string>(
                name: "AiSensyApiKey",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
