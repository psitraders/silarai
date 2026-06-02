using ReplyCart.Application.Orders.Queries;

namespace ReplyCart.Api.Controllers.v1;

internal static class InvoiceHelper
{
    internal record StoreInfo(
        string Name,
        string? LogoUrl,
        string? WhatsApp,
        string? ContactEmail,
        string Currency
    );

    internal static string BuildHtml(OrderDetailDto o, StoreInfo store)
    {
        Func<string, string> H = System.Net.WebUtility.HtmlEncode;

        var currencySymbol = store.Currency switch
        {
            "USD" => "$", "EUR" => "€", "GBP" => "£", "AED" => "AED ",
            "SGD" => "S$", "CAD" => "CA$", "AUD" => "A$",
            _ => "₹"
        };

        var rows = string.Join("", o.Items.Select(i =>
            "<tr>" +
            $"<td>{H(i.ProductTitle)}" +
            (i.VariantInfo != null ? $"<br/><small style='color:#64748b'>{H(i.VariantInfo)}</small>" : "") +
            "</td>" +
            $"<td style='text-align:center'>{i.Quantity}</td>" +
            $"<td style='text-align:right'>{currencySymbol}{i.UnitPrice:N2}</td>" +
            $"<td style='text-align:right'>{currencySymbol}{i.TotalPrice:N2}</td>" +
            "</tr>"));

        var phoneHtml   = o.CustomerPhone   != null ? $"<br/><span style='font-size:13px;color:#64748b'>{H(o.CustomerPhone)}</span>"   : "";
        var addrHtml    = o.DeliveryAddress != null ? $"<br/><span style='font-size:12px;color:#94a3b8'>{H(o.DeliveryAddress)}</span>" : "";
        var notesHtml   = o.Notes != null
            ? $"<div style='background:#f8fafc;border-radius:10px;padding:14px;font-size:13px;color:#64748b;margin-top:16px'><strong style='color:#475569'>Notes:</strong> {H(o.Notes)}</div>"
            : "";
        var orderNumber  = H(o.OrderNumber);
        var customerName = H(o.CustomerName ?? "Customer");
        var status       = H(o.Status);
        // Detect Razorpay payment from notes even if PaymentStatus wasn't set to Paid
        var isRazorpayPaid = o.Notes != null && o.Notes.Contains("Paid online via Razorpay", StringComparison.OrdinalIgnoreCase);
        var effectivePayStatus = (o.PaymentStatus == "Paid" || isRazorpayPaid) ? "Paid" : o.PaymentStatus;
        var payStatus    = H(effectivePayStatus);
        var invoiceDate  = o.CreatedAt.ToString("dd MMM yyyy");
        var totalAmount  = $"{currencySymbol}{o.TotalAmount:N2}";
        var storeName    = H(store.Name);
        var mediaPrint   = "@media print{body{background:#fff;padding:0}.invoice{box-shadow:none}.no-print{display:none}}";

        // Logo block: img tag or initials avatar
        var initial    = store.Name.Length > 0 ? store.Name[0].ToString().ToUpper() : "S";
        var logoBlock  = store.LogoUrl != null
            ? $"<img src='{H(store.LogoUrl)}' alt='{storeName}' style='height:56px;width:56px;border-radius:12px;object-fit:cover;border:2px solid rgba(255,255,255,.3)'/>"
            : $"<div style='height:56px;width:56px;border-radius:12px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff'>{H(initial)}</div>";

        // Store contact info for "From" block
        var storeContact = new System.Text.StringBuilder();
        if (store.WhatsApp != null)
            storeContact.Append($"<br/><span style='font-size:12px;color:#64748b'>📱 {H(store.WhatsApp)}</span>");
        if (store.ContactEmail != null)
            storeContact.Append($"<br/><span style='font-size:12px;color:#64748b'>✉️ {H(store.ContactEmail)}</span>");

        return $$"""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice #{{orderNumber}} — {{storeName}}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b;padding:24px}
  .invoice{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .header{background:linear-gradient(135deg,#0f766e,#0d9488);color:#fff;padding:32px;display:flex;align-items:flex-start;gap:20px}
  .header-text{flex:1}
  .header-text h1{font-size:22px;font-weight:800;letter-spacing:-.5px;margin-bottom:2px}
  .header-text p{opacity:.75;font-size:12px}
  .badge{display:inline-block;background:rgba(255,255,255,.2);border-radius:999px;padding:4px 14px;font-size:12px;font-weight:600;margin-top:10px}
  .body{padding:32px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid #f1f5f9}
  .meta-block p.label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;font-weight:600}
  .meta-block strong{font-size:14px;color:#1e293b;display:block}
  .meta-block .sub{font-size:12px;color:#64748b;margin-top:2px}
  .divider{height:1px;background:#f1f5f9;margin:20px 0}
  table{width:100%;border-collapse:collapse;margin-bottom:4px}
  thead tr{background:#f8fafc}
  th{padding:10px 14px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e2e8f0}
  td{padding:12px 14px;font-size:14px;border-bottom:1px solid #f8fafc}
  .total-row td{font-weight:700;font-size:15px;border-top:2px solid #e2e8f0;border-bottom:none;padding-top:16px}
  .footer{background:#f8fafc;padding:16px 32px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9}
  .footer a{color:#0d9488;text-decoration:none;font-weight:600}
  .status-badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600}
  .status-cod{background:#fef3c7;color:#92400e}
  .status-paid{background:#d1fae5;color:#065f46}
  {{mediaPrint}}
</style>
</head>
<body>
<div class="no-print" style="max-width:720px;margin:0 auto 16px;display:flex;gap:12px;align-items:center">
  <button onclick="window.print()" style="background:#0f766e;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">🖨 Print / Save as PDF</button>
  <button onclick="window.close()" style="background:#f1f5f9;color:#475569;border:none;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">Close</button>
</div>

<div class="invoice">
  <!-- Header with store branding -->
  <div class="header">
    {{logoBlock}}
    <div class="header-text">
      <h1>{{storeName}}</h1>
      <p>Order Invoice</p>
      <div class="badge">#{{orderNumber}}</div>
    </div>
    <div style="text-align:right;font-size:12px;opacity:.8">
      <div style="font-size:11px;opacity:.7;margin-bottom:2px">Date</div>
      <strong style="font-size:14px">{{invoiceDate}}</strong>
    </div>
  </div>

  <div class="body">
    <!-- From / Bill To grid -->
    <div class="meta">
      <div class="meta-block">
        <p class="label">From</p>
        <strong>{{storeName}}</strong>
        {{storeContact}}
      </div>
      <div class="meta-block" style="text-align:right">
        <p class="label">Bill To</p>
        <strong>{{customerName}}</strong>
        {{phoneHtml}}
        {{addrHtml}}
      </div>
    </div>

    <!-- Order meta row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div>
        <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:4px">Order #</p>
        <p style="font-size:14px;font-weight:700;color:#1e293b">#{{orderNumber}}</p>
      </div>
      <div>
        <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:4px">Status</p>
        <p style="font-size:14px;font-weight:600;color:#1e293b">{{status}}</p>
      </div>
      <div>
        <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:4px">Payment</p>
        <span class="status-badge {{(effectivePayStatus == "Paid" ? "status-paid" : "status-cod")}}">{{payStatus}}</span>
      </div>
    </div>

    <!-- Items table -->
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Rate</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{rows}}
        <tr class="total-row">
          <td colspan="3" style="color:#1e293b">Total</td>
          <td style="text-align:right;color:#0f766e">{{totalAmount}}</td>
        </tr>
      </tbody>
    </table>

    {{notesHtml}}
  </div>

  <div class="footer">
    Thank you for shopping with <strong>{{storeName}}</strong>!
    &nbsp;&middot;&nbsp;
    Powered by <a href="https://replycart.app" target="_blank">ReplyCart.app</a>
  </div>
</div>
</body>
</html>
""";
    }
}
