using System.Text;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Customers.Commands;
using ReplyCart.Application.Customers.Queries;
using ReplyCart.Domain.Customers;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;

namespace ReplyCart.Api.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/customers")]
public class CustomersController(IMediator mediator, IAppDbContext db, ITenantContext tenantContext) : ControllerBase
{
    // ── Queries ────────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? tag = null,
        CancellationToken ct = default)
        => Ok(await mediator.Send(new GetCustomersQuery(page, pageSize, search, tag), ct));

    [HttpGet("duplicates")]
    public async Task<IActionResult> GetDuplicates(CancellationToken ct)
        => Ok(await mediator.Send(new GetDuplicateCustomersQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await mediator.Send(new GetCustomerDetailQuery(id), ct));

    // ── Commands ───────────────────────────────────────────────────────────────

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveCustomerRequest req, CancellationToken ct)
    {
        var id = await mediator.Send(
            new CreateCustomerCommand(req.Name, req.PhoneNumber, req.Email, req.Address, req.City, req.Notes, req.Tags), ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveCustomerRequest req, CancellationToken ct)
    {
        await mediator.Send(
            new UpdateCustomerCommand(id, req.Name, req.PhoneNumber, req.Email, req.Address, req.City, req.Notes, req.Tags,
                req.Birthday, req.Anniversary), ct);
        return NoContent();
    }

    [HttpGet("birthdays")]
    public async Task<IActionResult> GetUpcomingBirthdays([FromQuery] int daysAhead = 30, CancellationToken ct = default)
        => Ok(await mediator.Send(new GetUpcomingBirthdaysQuery(daysAhead), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteCustomerCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{targetId:guid}/merge/{sourceId:guid}")]
    public async Task<IActionResult> Merge(Guid targetId, Guid sourceId, CancellationToken ct)
    {
        await mediator.Send(new MergeCustomersCommand(targetId, sourceId), ct);
        return NoContent();
    }

    /// <summary>
    /// AI-powered smart merge: finds all duplicate groups (same normalised phone or email)
    /// and auto-merges them — keeping the primary with the most order history.
    /// </summary>
    [HttpPost("smart-merge")]
    public async Task<IActionResult> SmartMerge(CancellationToken ct)
    {
        var result = await mediator.Send(new SmartMergeCustomersCommand(), ct);
        return Ok(result);
    }

    // ── B2B Customers ─────────────────────────────────────────────────────────

    /// <summary>Returns all CRM customers who registered as B2B buyers on the storefront.</summary>
    [HttpGet("b2b")]
    public async Task<IActionResult> GetB2B(CancellationToken ct)
        => Ok(await mediator.Send(new GetB2BCustomersQuery(), ct));

    /// <summary>Approves or revokes B2B status for a storefront customer (identified by CRM ID).</summary>
    [HttpPost("{crmCustomerId:guid}/b2b/approve")]
    public async Task<IActionResult> ApproveB2B(Guid crmCustomerId, [FromQuery] bool approve = true, CancellationToken ct = default)
    {
        try
        {
            await mediator.Send(new ApproveB2BCustomerCommand(crmCustomerId, approve), ct);
            return NoContent();
        }
        catch (NotFoundException)
        {
            return NotFound(new { error = "B2B customer not found." });
        }
    }

    // ── Export ─────────────────────────────────────────────────────────────────

    [HttpGet("export")]
    public async Task<IActionResult> Export(CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var customers = await db.Customers
            .Where(c => c.TenantId == tenantId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("Name,Phone,Email,Address,City,Tags,Notes,TotalOrders,TotalSpend,CreatedAt");
        foreach (var c in customers)
        {
            sb.AppendLine(string.Join(",",
                CsvEscape(c.Name), CsvEscape(c.PhoneNumber), CsvEscape(c.Email ?? ""),
                CsvEscape(c.Address ?? ""), CsvEscape(c.City ?? ""),
                CsvEscape(c.Tags ?? ""), CsvEscape(c.Notes ?? ""),
                c.TotalOrders, c.TotalSpend, c.CreatedAt.ToString("yyyy-MM-dd")));
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"customers-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    // ── Import ─────────────────────────────────────────────────────────────────

    [HttpPost("import")]
    public async Task<IActionResult> Import(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { errors = new[] { "Please upload a CSV file." } });

        var tenantId = tenantContext.CurrentTenantId;

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync(ct);
        if (headerLine is null)
            return BadRequest(new { errors = new[] { "Empty file." } });

        // Expected: Name,Phone,Email,Address,City,Tags,Notes
        int created = 0, updated = 0, skipped = 0;
        string? line;
        int lineNum = 1;

        while ((line = await reader.ReadLineAsync(ct)) is not null)
        {
            lineNum++;
            var cols = ParseCsvLine(line);
            if (cols.Length < 2) { skipped++; continue; }

            var name  = cols[0].Trim();
            var phone = cols[1].Trim();
            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(phone)) { skipped++; continue; }

            var email   = cols.Length > 2 ? cols[2].Trim() : null;
            var address = cols.Length > 3 ? cols[3].Trim() : null;
            var city    = cols.Length > 4 ? cols[4].Trim() : null;
            var tags    = cols.Length > 5 ? cols[5].Trim() : null;
            var notes   = cols.Length > 6 ? cols[6].Trim() : null;

            // Upsert by phone number
            var existing = await db.Customers
                .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.PhoneNumber == phone, ct);

            if (existing is not null)
            {
                existing.Name    = name;
                existing.Email   = string.IsNullOrEmpty(email) ? existing.Email : email;
                existing.Address = string.IsNullOrEmpty(address) ? existing.Address : address;
                existing.City    = string.IsNullOrEmpty(city) ? existing.City : city;
                existing.Tags    = string.IsNullOrEmpty(tags) ? existing.Tags : tags;
                existing.Notes   = string.IsNullOrEmpty(notes) ? existing.Notes : notes;
                updated++;
            }
            else
            {
                db.Customers.Add(new Customer
                {
                    TenantId    = tenantId,
                    Name        = name,
                    PhoneNumber = phone,
                    Email       = string.IsNullOrEmpty(email) ? null : email,
                    Address     = string.IsNullOrEmpty(address) ? null : address,
                    City        = string.IsNullOrEmpty(city) ? null : city,
                    Tags        = string.IsNullOrEmpty(tags) ? null : tags,
                    Notes       = string.IsNullOrEmpty(notes) ? null : notes,
                });
                created++;
            }
        }

        await db.SaveChangesAsync(ct);
        return Ok(new { created, updated, skipped });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static string CsvEscape(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }

    /// <summary>Minimal CSV line parser (handles quoted fields with commas).</summary>
    private static string[] ParseCsvLine(string line)
    {
        var result = new List<string>();
        var inQuotes = false;
        var current = new StringBuilder();
        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                { current.Append('"'); i++; }
                else
                { inQuotes = !inQuotes; }
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString()); current.Clear();
            }
            else
            { current.Append(c); }
        }
        result.Add(current.ToString());
        return result.ToArray();
    }
}

public record SaveCustomerRequest(
    string   Name,
    string   PhoneNumber,
    string?  Email,
    string?  Address,
    string?  City,
    string?  Notes,
    string?  Tags,
    DateOnly? Birthday    = null,
    DateOnly? Anniversary = null
);


