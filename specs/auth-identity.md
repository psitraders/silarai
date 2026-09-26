---
id: auth-identity
status: current
context: "§3, §4.3 Identity, §5.2, §5.3"
---
# Auth & Identity

## Purpose
Sign-up, login and session management for merchant dashboard users (store owner, Business Admins and SuperAdmin), and the owner's team management.

## Scope
- **In:** register, login, refresh, logout, `me`, email verification, password reset, OTP, TOTP 2FA, profile, active sessions, roles, team management (invite / deactivate Business Admins).
- **Out:** storefront customer login (`storefront`), chatbot widget API-key auth (`chatbot-service`).

## Rules
- **AUTH-R1** — JWT access token 15 min + refresh token 30 days; refresh tokens and email/reset tokens are stored hashed.
- **AUTH-R2** — Passwords hashed with BCrypt; 2FA is optional TOTP.
- ~~**AUTH-R3** — Roles are flat and fixed: `SuperAdmin`, `TenantAdmin`, `Manager`, `Staff`. No per-tenant custom roles.~~ Replaced by AUTH-R6.
- **AUTH-R4** — Frontend refreshes on 401 via a single-flight queue; if refresh fails it force-logs-out (clears all auth storage, hard redirect to `/login`) to avoid redirect loops.
- **AUTH-R5** — `Jwt:Secret` must be ≥ 32 chars; startup fails fast otherwise (intentional).
- **AUTH-R6** — Roles are flat and fixed: `SuperAdmin` (platform), `TenantAdmin` (store owner), `BusinessAdmin` (invited by the owner, one level below). No per-tenant custom roles.
- **AUTH-R7** — A `BusinessAdmin` has the same tenant access as the `TenantAdmin` except managing admins and changing the plan (TEN-R6).
- **AUTH-R8** — Only the `TenantAdmin` manages Business Admins: invite by email link (expires in 7 days; accepting sets the password and verifies the email), resend invite, deactivate / reactivate. The owner account cannot be managed there. Deactivation revokes the admin's sessions. No limit on the number of admins for now.
- See INV-5 (separate storefront auth).

## UI
- `pages/auth/` — Login, Register, ForgotPassword, ResetPassword, VerifyEmail.
- `pages/settings/AccountSecurityPage.tsx` — 2FA, sessions.
- `pages/settings/TeamPage.tsx` (`/settings/team`, owner-only, "Team" in the sidebar) — invite and manage Business Admins.
- `pages/auth/AcceptInvitePage.tsx` (`/accept-invite`) — invited admin sets their password.
- `store/auth.store.ts`, `api/client.ts` (token refresh).

## Suggestions
- Confirm the OTP provider key exists in `PlatformSettings` — its original seed row was lost with the superseded `AddPlatformSettings` migration (context §4.6).
- Tokens are duplicated into plain `localStorage` keys for the axios interceptor; consider a single source.

## Changes to be done
