# ReplyCart

A multi-tenant SaaS platform for boutique/clothing sellers to manage product catalogs, leads, orders, and WhatsApp/Instagram/Facebook inquiries from a single dashboard.

## Project Structure

```
├── backend/                          # ASP.NET Core 10 Web API
│   ├── ReplyCart.slnx                # Solution file
│   └── src/
│       ├── ReplyCart.Api/            # Controllers, middleware, Program.cs
│       ├── ReplyCart.Application/    # CQRS commands, queries, interfaces
│       ├── ReplyCart.Domain/         # Entities, enums, domain logic
│       ├── ReplyCart.Infrastructure/ # EF Core, JWT, storage, AI provider
│       └── ReplyCart.Shared/         # Constants, roles, plan limits
└── frontend/                         # React 19 + Vite + TypeScript + Tailwind
    └── src/
        ├── api/                      # Axios API clients
        ├── components/               # UI components + layout
        ├── pages/                    # All merchant & public pages
        ├── store/                    # Zustand auth store
        └── types/                    # TypeScript types
```

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (LocalDB works for development)
- EF Core CLI tools: `dotnet tool install --global dotnet-ef`

## Running the Backend

### 1. Configure the database connection

Edit `backend/src/ReplyCart.Api/appsettings.json` and set the connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ReplyCart;Trusted_Connection=True;"
}
```

For a full SQL Server instance:
```json
"DefaultConnection": "Server=localhost;Database=ReplyCart;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
```

### 2. Apply the database migration

```bash
cd backend
dotnet ef database update --project src/ReplyCart.Infrastructure --startup-project src/ReplyCart.Api
```

### 3. Start the API

```bash
cd backend
dotnet run --project src/ReplyCart.Api
```

The API will be available at:
- **HTTP:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger`

## Running the Frontend

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure the API URL (optional)

```bash
cp frontend/.env.example frontend/.env
```

By default the dev server proxies `/api` → `http://localhost:5000`, so no change is needed for local dev.

### 3. Start the dev server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## First Run

1. Open `http://localhost:5173/register` and create your first account.
2. You will be redirected to the dashboard.
3. Go to **Settings** to fill in your business profile and WhatsApp number.
4. Go to **Storefront** to set your store URL slug.
5. Your public storefront is live at `http://localhost:5173/s/{your-slug}`.

## Building for Production

**Backend:**
```bash
cd backend
dotnet publish src/ReplyCart.Api -c Release -o ./publish
```

**Frontend:**
```bash
cd frontend
npm run build
# Output is in frontend/dist/
```

## Key Configuration (`backend/src/ReplyCart.Api/appsettings.json`)

| Key | Default | Description |
|-----|---------|-------------|
| `ConnectionStrings:DefaultConnection` | LocalDB | SQL Server connection string |
| `Jwt:SecretKey` | (change this) | HS256 signing key — **must change in production** |
| `Jwt:Issuer` | `ReplyCart` | JWT issuer |
| `Jwt:Audience` | `ReplyCart` | JWT audience |
| `Ai:Provider` | `Mock` | AI provider — `Mock` for launch, swap to `OpenAI` later |
| `Storage:Provider` | `Local` | File storage — `Local` saves to `wwwroot/uploads/` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | ASP.NET Core 10 |
| ORM | EF Core 9 + SQL Server |
| Architecture | Clean Architecture / Modular Monolith |
| CQRS | MediatR |
| Auth | JWT Bearer (15 min) + Refresh tokens (30 day, hashed) |
| Passwords | BCrypt.Net |
| Background jobs | Hangfire |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand (persisted) |
| Data fetching | TanStack React Query v5 |
| Forms | react-hook-form |
| Charts | Recharts |
