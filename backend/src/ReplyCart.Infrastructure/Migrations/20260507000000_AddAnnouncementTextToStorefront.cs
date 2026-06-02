using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReplyCart.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAnnouncementTextToStorefront : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnnouncementText",
                table: "StorefrontSettings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnnouncementText",
                table: "StorefrontSettings");
        }
    }
}
