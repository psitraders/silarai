using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// Production email service using SMTP via MailKit.
/// Configure in Azure App Service â†’ Configuration:
///   Smtp__Host, Smtp__Port, Smtp__Username, Smtp__Password, Smtp__EnableSsl
/// </summary>
public class EmailService(IConfiguration config, ILogger<EmailService> logger) : IEmailService
{
    private readonly string _appUrl        = config["AppUrl"]        ?? "https://www.silarai.app";
    private readonly string _dashboardUrl  = (config["FrontendUrl"]  ?? "https://silarai.app").TrimEnd('/');
    private readonly string _fromEmail     = config["Smtp:FromEmail"] ?? "support@silarai.app";
    private readonly string _fromName      = "ReplyCart";

    // â”€â”€ Email verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendEmailVerificationAsync(string toEmail, string toName, string token, CancellationToken ct = default)
    {
        var link = $"{_appUrl}/verify-email?token={Uri.EscapeDataString(token)}";
        var subject = "Verify your ReplyCart email";
        var html = BuildVerifyEmailHtml(toName, link);
        await SendAsync(toEmail, toName, subject, html, ct);
    }

    // â”€â”€ Password reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendPasswordResetAsync(string toEmail, string toName, string token, CancellationToken ct = default)
    {
        var link = $"{_appUrl}/reset-password?token={Uri.EscapeDataString(token)}";
        var subject = "Reset your ReplyCart password";
        var html = BuildPasswordResetHtml(toName, link);
        await SendAsync(toEmail, toName, subject, html, ct);
    }

    // â”€â”€ Registration OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendRegistrationOtpAsync(string toEmail, string toName, string otp, CancellationToken ct = default)
    {
        var subject = $"{otp} is your ReplyCart verification code";
        var html = BuildOtpHtml(toName, otp);
        await SendAsync(toEmail, toName, subject, html, ct);
    }

    // â”€â”€ COD order OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendCodOtpAsync(string toEmail, string toName, string storeName, string otp, CancellationToken ct = default)
    {
        var subject = $"{otp} â€” verify your order at {storeName}";
        var html    = BuildCodOtpHtml(toName, storeName, otp);
        await SendAsync(toEmail, toName, subject, html, ct);
    }

    // â”€â”€ Customer: order confirmation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendOrderConfirmationAsync(
        string toEmail, string toName, string storeName,
        string orderNumber, string? deliveryAddress, decimal totalAmount,
        string currency, IEnumerable<ReplyCart.Application.Common.Interfaces.OrderNotificationItem> items,
        string? trackingUrl, CancellationToken ct = default)
    {
        var subject = $"Your order is confirmed! {orderNumber} â€” {storeName}";
        var html    = BuildOrderConfirmationHtml(toName, storeName, orderNumber,
                          deliveryAddress, totalAmount, currency, items, trackingUrl);
        await SendAsync(toEmail, toName, subject, html, ct);
    }

    // â”€â”€ Owner: new inquiry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendNewInquiryNotificationAsync(
        string toEmail, string ownerName, string storeName,
        string customerName, string? customerPhone, string? customerEmail,
        string channel, string? productTitle, string? message,
        bool isNewCustomer, CancellationToken ct = default)
    {
        var subject = $"ðŸ“© New inquiry from {customerName} â€” {storeName}";
        var html    = BuildNewInquiryHtml(ownerName, storeName, customerName, customerPhone,
                          customerEmail, channel, productTitle, message, isNewCustomer,
                          $"{_dashboardUrl}/leads");
        await SendAsync(toEmail, ownerName, subject, html, ct);
    }

    // â”€â”€ Owner: new order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendNewOrderNotificationAsync(
        string toEmail, string ownerName, string storeName,
        string orderNumber, string customerName, string? customerPhone,
        string? customerEmail, string? deliveryAddress, decimal totalAmount,
        string currency, IEnumerable<ReplyCart.Application.Common.Interfaces.OrderNotificationItem> items,
        string source, bool isNewCustomer, string? manageOrderUrl, CancellationToken ct = default)
    {
        var subject = $"ðŸ›’ New order {orderNumber} from {customerName} â€” {storeName}";
        var html    = BuildNewOrderHtml(ownerName, storeName, orderNumber, customerName,
                          customerPhone, customerEmail, deliveryAddress, totalAmount,
                          currency, items, source, isNewCustomer,
                          manageOrderUrl ?? $"{_dashboardUrl}/orders");
        await SendAsync(toEmail, ownerName, subject, html, ct);
    }

    // â”€â”€ Owner: new chatbot lead â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendNewLeadNotificationAsync(
        string toEmail, string ownerName, string storeName,
        string customerName, string customerPhone, CancellationToken ct = default)
    {
        var subject = $"ðŸ¤ New lead captured â€” {customerName} ({storeName})";
        var html    = BuildNewLeadHtml(ownerName, storeName, customerName, customerPhone,
                          $"{_dashboardUrl}/leads");
        await SendAsync(toEmail, ownerName, subject, html, ct);
    }

    // â”€â”€ Core SMTP sender â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private async Task SendAsync(string toEmail, string toName, string subject, string html, CancellationToken ct)
    {
        var host     = config["Smtp:Host"];
        var portStr  = config["Smtp:Port"];
        var username = config["Smtp:Username"];
        var password = config["Smtp:Password"];

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            // Dev fallback â€” log the email content so developers can see it
            logger.LogWarning(
                "[EMAIL - NOT SENT] To: {To} | Subject: {Subject} | SMTP not configured. " +
                "Set Smtp:Host, Smtp:Port, Smtp:Username, Smtp:Password in config.",
                toEmail, subject);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = html }.ToMessageBody();

        var port    = int.TryParse(portStr, out var p) ? p : 465;
        // Port 465 â†’ implicit SSL (SslOnConnect); port 587 â†’ STARTTLS; anything else â†’ auto
        var secOpts = port == 465
            ? SecureSocketOptions.SslOnConnect
            : port == 587
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.Auto;

        logger.LogInformation("[EMAIL] Connecting to {Host}:{Port} mode={Mode}", host, port, secOpts);

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, secOpts, ct);
            await client.AuthenticateAsync(username, password, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
            logger.LogInformation("[EMAIL SENT] To: {To} | Subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[EMAIL ERROR] Host={Host}:{Port} | To: {To} | {Msg}", host, port, toEmail, ex.Message);
            throw;
        }
    }

    // â”€â”€ HTML Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private static string BuildOtpHtml(string name, string otp) => $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Verify your email</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.5px;">ReplyCart</td>
            <td align="right"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;">Email Verification</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 32px 28px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1e293b;">Hi {{name}},</p>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">Use the code below to verify your email and complete your ReplyCart registration. This code expires in <strong>10 minutes</strong>.</p>
        <!-- OTP box -->
        <div style="background:#f0fdf9;border:2px dashed #0d9488;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
          <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#0f766e;font-family:monospace;">{{otp}}</p>
        </div>
        <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">If you didn't request this, you can safely ignore this email. Someone may have typed your email by mistake.</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
          Sent by <strong style="color:#0f766e;">ReplyCart</strong> Â· <a href="https://silarai.app" style="color:#0d9488;text-decoration:none;">silarai.app</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";

    private static string BuildVerifyEmailHtml(string name, string link) => $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Verify your email</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:28px 32px;color:#fff;font-size:20px;font-weight:800;">ReplyCart</td></tr>
      <tr><td style="padding:36px 32px 28px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1e293b;">Hi {{name}},</p>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">Click the button below to verify your email address and activate your account.</p>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="{{link}}" style="display:inline-block;background:#0f766e;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;">Verify Email Address</a>
        </div>
        <p style="margin:0;font-size:12px;color:#94a3b8;">Or copy this link: <a href="{{link}}" style="color:#0d9488;word-break:break-all;">{{link}}</a></p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Sent by <strong style="color:#0f766e;">ReplyCart</strong></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";

    private static string BuildPasswordResetHtml(string name, string link) => $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Reset your password</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:28px 32px;color:#fff;font-size:20px;font-weight:800;">ReplyCart</td></tr>
      <tr><td style="padding:36px 32px 28px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1e293b;">Hi {{name}},</p>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">We received a request to reset your ReplyCart password. Click the button below â€” this link expires in 1 hour.</p>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="{{link}}" style="display:inline-block;background:#0f766e;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;">Reset Password</a>
        </div>
        <p style="margin:0;font-size:12px;color:#94a3b8;">If you didn't request this, ignore this email â€” your password won't change.</p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Sent by <strong style="color:#0f766e;">ReplyCart</strong></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";

    private static string BuildCodOtpHtml(string name, string storeName, string otp) => $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Confirm your order</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#78350f,#92400e);padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.5px;">{{storeName}}</td>
            <td align="right"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;">Order Verification</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 32px 28px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1e293b;">Hi {{name}},</p>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">
          Thanks for shopping at <strong>{{storeName}}</strong>! Please use the verification code below to confirm your
          Cash on Delivery order. The code expires in <strong>10 minutes</strong>.
        </p>
        <!-- OTP box -->
        <div style="background:#fffbeb;border:2px dashed #d97706;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
          <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#78350f;font-family:monospace;">{{otp}}</p>
        </div>
        <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">
          Didn't place this order? You can safely ignore this email â€” no order will be created without the code.
        </p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
          Powered by <strong style="color:#0f766e;">ReplyCart</strong> Â· <a href="https://silarai.app" style="color:#0d9488;text-decoration:none;">silarai.app</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";

    // â”€â”€ Owner notification templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private static string BuildNewInquiryHtml(
        string ownerName, string storeName, string customerName,
        string? customerPhone, string? customerEmail,
        string channel, string? productTitle, string? message, bool isNewCustomer,
        string leadsUrl)
    {
        var newBadge = isNewCustomer
            ? "<span style=\"background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:8px;\">NEW CUSTOMER</span>"
            : "";

        var productRow = string.IsNullOrWhiteSpace(productTitle) ? "" : $"""
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;width:130px;">Product</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{productTitle}</td>
          </tr>
""";
        var messageRow = string.IsNullOrWhiteSpace(message) ? "" : $"""
          <tr>
            <td colspan="2" style="padding:12px 0 0;">
              <div style="background:#f8fafc;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:12px 14px;font-size:13px;color:#334155;line-height:1.6;">{message}</div>
            </td>
          </tr>
""";

        return $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>New Inquiry</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.5px;">{{storeName}}</td>
            <td align="right"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;">New Inquiry ðŸ“©</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1e293b;">Hi {{ownerName}},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">You have a new inquiry on your store. Here are the details:</p>

        <!-- Customer card -->
        <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.8px;">Customer Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;width:130px;">Name</td>
              <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{{customerName}}{{newBadge}}</td>
            </tr>
            {{(string.IsNullOrWhiteSpace(customerPhone) ? "" : $"""
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Phone</td>
              <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{customerPhone}</td>
            </tr>
""")}}
            {{(string.IsNullOrWhiteSpace(customerEmail) ? "" : $"""
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Email</td>
              <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{customerEmail}</td>
            </tr>
""")}}
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Channel</td>
              <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{{channel}}</td>
            </tr>
            {{productRow}}
          </table>
          {{messageRow}}
        </div>

        <div style="text-align:center;">
          <a href="{{leadsUrl}}" style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">View in Dashboard â†’</a>
        </div>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
          Powered by <strong style="color:#0f766e;">ReplyCart</strong> Â· <a href="https://silarai.app" style="color:#0d9488;text-decoration:none;">silarai.app</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";
    }

    private static string BuildNewOrderHtml(
        string ownerName, string storeName, string orderNumber,
        string customerName, string? customerPhone, string? customerEmail,
        string? deliveryAddress, decimal totalAmount, string currency,
        IEnumerable<ReplyCart.Application.Common.Interfaces.OrderNotificationItem> items,
        string source, bool isNewCustomer, string manageOrderUrl)
    {
        var newBadge = isNewCustomer
            ? "<span style=\"background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:8px;\">NEW CUSTOMER</span>"
            : "";

        var itemRows = string.Join("\n", items.Select(i =>
        {
            var variant = string.IsNullOrWhiteSpace(i.VariantInfo) ? "" : $" <span style=\"color:#94a3b8;font-size:11px;\">({i.VariantInfo})</span>";
            return $"""
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;">{i.Title}{variant}</td>
              <td style="padding:8px 0;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">Ã—{i.Qty}</td>
              <td style="padding:8px 0;font-size:13px;color:#1e293b;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">{currency} {i.Qty * i.UnitPrice:F2}</td>
            </tr>
""";
        }));

        var addressRow = string.IsNullOrWhiteSpace(deliveryAddress) ? "" : $"""
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;width:130px;">Delivery to</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{deliveryAddress}</td>
          </tr>
""";

        return $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>New Order</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.5px;">{{storeName}}</td>
            <td align="right"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;">New Order ðŸ›’</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1e293b;">Hi {{ownerName}},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">Great news! You have a new COD order. Here's the summary:</p>

        <!-- Order number + source -->
        <div style="background:#f0fdf9;border-radius:10px;padding:14px 20px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:15px;font-weight:800;color:#0f766e;letter-spacing:.5px;">{{orderNumber}}</span>
          <span style="font-size:11px;font-weight:600;color:#64748b;background:#e2e8f0;padding:3px 10px;border-radius:999px;">via {{source}}</span>
        </div>

        <!-- Customer details -->
        <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.8px;">Customer</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;width:130px;">Name</td>
              <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{{customerName}}{{newBadge}}</td>
            </tr>
            {{(string.IsNullOrWhiteSpace(customerPhone) ? "" : $"""
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Phone</td>
              <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{customerPhone}</td>
            </tr>
""")}}
            {{(string.IsNullOrWhiteSpace(customerEmail) ? "" : $"""
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;">Email</td>
              <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500;">{customerEmail}</td>
            </tr>
""")}}
            {{addressRow}}
          </table>
        </div>

        <!-- Items -->
        <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.8px;">Order Items</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-align:left;border-bottom:2px solid #e2e8f0;">Product</th>
              <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-align:center;border-bottom:2px solid #e2e8f0;">Qty</th>
              <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-align:right;border-bottom:2px solid #e2e8f0;">Amount</th>
            </tr>
            {{itemRows}}
            <tr>
              <td colspan="2" style="padding:12px 0 0;font-size:14px;font-weight:700;color:#1e293b;">Total (COD)</td>
              <td style="padding:12px 0 0;font-size:16px;font-weight:800;color:#0f766e;text-align:right;">{{currency}} {{totalAmount:F2}}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;">
          <a href="{{manageOrderUrl}}" style="display:inline-block;background:#0f766e;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">Manage Order â†’</a>
        </div>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
          Powered by <strong style="color:#0f766e;">ReplyCart</strong> Â· <a href="https://silarai.app" style="color:#0d9488;text-decoration:none;">silarai.app</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";
    }

    private static string BuildNewLeadHtml(
        string ownerName, string storeName, string customerName, string customerPhone, string leadsUrl)
        => $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>New Lead</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#7c3aed,#8b5cf6);padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.5px;">{{storeName}}</td>
            <td align="right"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;">New Lead ðŸ¤</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1e293b;">Hi {{ownerName}},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">Your AI chatbot just captured a new lead! Here are their details:</p>

        <!-- Lead card -->
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
          <div style="width:52px;height:52px;background:#7c3aed;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-size:22px;font-weight:800;">{{customerName[0]}}</span>
          </div>
          <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#1e293b;">{{customerName}}</p>
          <p style="margin:0;font-size:14px;color:#7c3aed;font-weight:600;">{{customerPhone}}</p>
        </div>

        <p style="margin:0 0 24px;font-size:13px;color:#64748b;text-align:center;line-height:1.6;">
          They've been chatting on your storefront â€” follow up now to close the sale! ðŸš€
        </p>

        <div style="text-align:center;">
          <a href="{{leadsUrl}}" style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">View Lead â†’</a>
        </div>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
          Powered by <strong style="color:#0f766e;">ReplyCart</strong> Â· <a href="https://silarai.app" style="color:#0d9488;text-decoration:none;">silarai.app</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";

    // â”€â”€ Customer order confirmation / bill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private static string BuildOrderConfirmationHtml(
        string customerName, string storeName, string orderNumber,
        string? deliveryAddress, decimal totalAmount, string currency,
        IEnumerable<ReplyCart.Application.Common.Interfaces.OrderNotificationItem> items,
        string? trackingUrl)
    {
        var itemRows = string.Join("\n", items.Select(i =>
        {
            var variant = string.IsNullOrWhiteSpace(i.VariantInfo) ? "" : $" <span style=\"color:#94a3b8;font-size:11px;\">({i.VariantInfo})</span>";
            return $"""
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;">{i.Title}{variant}</td>
              <td style="padding:10px 0;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">Ã—{i.Qty}</td>
              <td style="padding:10px 0;font-size:13px;color:#1e293b;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">{currency} {i.Qty * i.UnitPrice:F2}</td>
            </tr>
""";
        }));

        var addressBlock = string.IsNullOrWhiteSpace(deliveryAddress) ? "" : $"""
        <div style="background:#f0fdf9;border-radius:10px;padding:14px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.8px;">Delivery Address</p>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">{deliveryAddress}</p>
        </div>
""";

        var trackBtn = string.IsNullOrWhiteSpace(trackingUrl) ? "" : $"""
        <div style="text-align:center;margin-top:24px;">
          <a href="{trackingUrl}" style="display:inline-block;background:#0f766e;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">Track Your Order â†’</a>
        </div>
""";

        return $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Order Confirmed</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:560px;width:100%;">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.5px;">{{storeName}}</td>
            <td align="right"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;">Order Confirmed âœ“</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px 32px 28px;">
        <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1e293b;">Thank you, {{customerName}}! ðŸŽ‰</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
          Your order has been placed successfully and is being processed. We'll contact you soon to confirm the delivery.
        </p>

        <!-- Order number badge -->
        <div style="background:#f0fdf9;border:1px dashed #0d9488;border-radius:10px;padding:14px 20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Order Reference</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#0f766e;letter-spacing:1px;">{{orderNumber}}</p>
        </div>

        <!-- Delivery address -->
        {{addressBlock}}

        <!-- Items table -->
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1e293b;">Order Summary</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-align:left;border-bottom:2px solid #e2e8f0;">Item</th>
              <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-align:center;border-bottom:2px solid #e2e8f0;">Qty</th>
              <th style="padding:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;text-align:right;border-bottom:2px solid #e2e8f0;">Price</th>
            </tr>
            {{itemRows}}
            <tr>
              <td colspan="2" style="padding:14px 0 0;font-size:14px;font-weight:700;color:#1e293b;">Total</td>
              <td style="padding:14px 0 0;font-size:18px;font-weight:800;color:#0f766e;text-align:right;">{{currency}} {{totalAmount:F2}}</td>
            </tr>
          </table>
        </div>

        <!-- Payment note -->
        <div style="background:#fffbeb;border-left:3px solid #d97706;border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#92400e;font-weight:500;">
            ðŸ’µ <strong>Cash on Delivery</strong> â€” please keep <strong>{{currency}} {{totalAmount:F2}}</strong> ready at the time of delivery.
          </p>
        </div>

        {{trackBtn}}
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
          This confirmation was sent by <strong style="color:#0f766e;">{{storeName}}</strong> via ReplyCart Â· <a href="https://silarai.app" style="color:#0d9488;text-decoration:none;">silarai.app</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
""";
    }

    // â”€â”€ Platform admin: upgrade request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public async Task SendUpgradeRequestNotificationAsync(
        string adminEmail, string tenantName, string tenantEmail,
        string requestedPlanName, bool isAnnual, decimal pricePaid,
        string reviewUrl, CancellationToken ct = default)
    {
        var billing  = isAnnual ? "Annual" : "Monthly";
        var subject  = $"â¬†ï¸ Plan upgrade requested â€” {tenantName} â†’ {requestedPlanName}";
        var html     = BuildUpgradeRequestHtml(tenantName, tenantEmail, requestedPlanName, billing, pricePaid, reviewUrl);
        await SendAsync(adminEmail, "Silarai Admin", subject, html, ct);
    }

    private static string BuildUpgradeRequestHtml(
        string tenantName, string tenantEmail, string planName,
        string billing, decimal pricePaid, string reviewUrl)
        => $$"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Plan Upgrade Request</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;">â¬†ï¸</p>
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">New Upgrade Request</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">A tenant has requested a plan upgrade</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 24px;font-size:15px;color:#475569;">
          <strong>{{tenantName}}</strong> has requested to upgrade to the <strong>{{planName}}</strong> plan.
          Please review and approve or reject from the admin panel.
        </p>

        <!-- Details table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Tenant</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{tenantName}}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Email</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{tenantEmail}}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Requested Plan</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#7c3aed;border-bottom:1px solid #e2e8f0;">{{planName}}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Billing</td>
            <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">{{billing}}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Price</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#1e293b;">â‚¹{{pricePaid:N0}}</td>
          </tr>
        </table>

        <!-- CTA button -->
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <a href="{{reviewUrl}}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:-0.2px;">
            Review in Admin Panel â†’
          </a>
        </td></tr></table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">ReplyCart Platform Â· This is an automated admin notification</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
""";
}




