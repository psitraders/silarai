using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInstagramFacebookCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FacebookPageAccessToken",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FacebookPageId",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstagramAccessToken",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstagramAccountId",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FacebookPageAccessToken",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "FacebookPageId",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "InstagramAccessToken",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "InstagramAccountId",
                table: "Businesses");
        }
    }
}
