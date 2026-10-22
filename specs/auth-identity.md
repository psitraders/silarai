---
id: auth-identity
status: current
prefix: AUTH
related: [auth-team, tenancy-plans, app-shell]
---
# Auth & Identity

## Purpose
Sign-up, login and session management for merchant dashboard users (store owner, Business Admins and SuperAdmin): registration with email OTP, password / email-OTP login, optional TOTP 2FA, password reset, profile and active sessions.

## Scope
- **In:** register, login (password, email OTP, phone OTP API), refresh, logout, `me`, email verification, password reset, TOTP 2FA, profile, change password, active sessions, roles, JWT issuing.
- **Out:** Business Admin invitations and team management (`auth-team`), storefront customer login (`storefront-accounts`), chatbot widget API-key auth (`chatbot-service`), landing-chat account creation (`superadmin-landing`).

## Functional behaviour
- **Register** (`/register`): owner enters business name, owner name, email, password, phone, country, language, currency → requests a 6-digit email code (60 s resend cooldown, valid 10 min) → enters it (email marked verified for 15 min) → account is created. Registration creates the `Tenant` (slug from the business name, `-1`, `-2` … on clash), `User` with role `TenantAdmin`, `Business` (currency / country / language), `StorefrontSettings` (same slug) and a 10-day **Trial** on the `basic` plan; a verification email is also sent (fire-and-forget). The user is sent to `/login`.
- **Login** (`/login`): tab *Email* (password; when 2FA is on the API answers `requiresTwoFactor` and the page asks for the authenticator code) or tab *Email OTP* (code sent to a registered, active account). Suspended tenants get 403 "account suspended".
- **Forgot password** (`/forgot-password`): email → 6-digit code (10 min, 60 s cooldown; the response never reveals whether the email exists) → code exchanged for a 15-min reset token → new password (≥ 8 chars). Reset revokes every refresh token of the user. `/reset-password?token=` accepts a link-style token too.
- **Email verification**: `/verify-email?token=` (24 h link); can be re-sent from *Account & Security*.
- **Account & Security** (`/settings/account`): profile (name, phone), email verification status, change password (current required, ≥ 8 chars), TOTP 2FA (setup shows secret + `otpauth://` URI, verify a code to enable, password to disable), active sessions (device info, created / expiry, revoke).
- **Session handling in the browser**: access token sent as Bearer; on 401 the client refreshes once (single-flight queue); if refresh fails it clears all auth storage and hard-redirects to `/login`.

## Rules
- **AUTH-R1** — JWT access token 15 min + refresh token 30 days; refresh tokens and email / reset / invite tokens are stored hashed.
- **AUTH-R2** — Passwords hashed with BCrypt; 2FA is optional TOTP.
- ~~**AUTH-R3** — Roles are flat and fixed: `SuperAdmin`, `TenantAdmin`, `Manager`, `Staff`. No per-tenant custom roles.~~ Replaced by AUTH-R6.
- **AUTH-R4** — Frontend refreshes on 401 via a single-flight queue; if refresh fails it force-logs-out (clears all auth storage, hard redirect to `/login`) to avoid redirect loops.
- **AUTH-R5** — `Jwt:Secret` must be ≥ 32 chars; startup fails fast otherwise (intentional).
- **AUTH-R6** — Roles are flat and fixed: `SuperAdmin` (platform), `TenantAdmin` (store owner), `BusinessAdmin` (invited by the owner, one level below). No per-tenant custom roles. (`StorefrontCustomer` is a separate token role used only by `storefront-accounts`.)
- AUTH-R7, AUTH-R8 (Business Admin access and management) live in `auth-team`.
- **AUTH-R9** — A tenant can only be registered after its email passed the registration OTP; one email = one user across all tenants (unique `Users.Email`).
- **AUTH-R10** — Refresh tokens rotate: every refresh revokes the used token (`Rotated`) and issues a new one. Logout, session revoke, password reset and Business Admin deactivation revoke refresh tokens; an access token stays valid until it expires (≤ 15 min).
- **AUTH-R11** — Password-reset and login-OTP requests never reveal whether an email is registered (forgot-password always answers success).
- See INV-5 (separate storefront auth).

## Backend
- **Data:** `Identity/User` (`BaseEntity`, not tenant-filtered: `TenantId`, `Name`, `Email` unique, `PasswordHash`, `Phone`, `IsActive`, `IsEmailVerified`, `IsTwoFactorEnabled`, `TotpSecret`, `LastLoginAt`), `Role` / `UserRole` (roles created on first use, not seeded), `UserRefreshToken` (`TokenHash`, `ExpiresAt`, `DeviceInfo`, `IsRevoked`, `RevokedReason`), `UserToken` (`Type` = EmailVerification | PasswordReset | Invitation, `TokenHash`, `ExpiresAt`, `IsUsed`). OTP codes and "email verified" flags live in `IMemoryCache` (lost on restart).
- **API — `AuthController` `/api/v1/auth`:** `POST register`, `POST login` (`{email, password, deviceInfo, totpCode?}` → tokens or `{requiresTwoFactor}`), `POST refresh`, `POST logout` 🔒, `GET me` 🔒, `POST send-verification` 🔒, `POST verify-email`, `POST forgot-password`, `POST verify-reset-otp` → `{token}`, `POST reset-password`, `POST accept-invite` (see `auth-team`), `PUT profile` 🔒, `PUT change-password` 🔒, `GET sessions` 🔒, `DELETE sessions/{id}` 🔒, `GET totp/status` 🔒, `POST totp/setup|verify|disable` 🔒.
- **API — `OtpController` `/api/v1/auth/otp` (anonymous):** `send-registration-email`, `verify-registration-email`, `send-login-email`, `verify-login-email` (→ tokens), `send` / `verify` (phone SMS OTP login via 2Factor.in for an existing account). Legacy, unused by the UI: `send-registration`, `skip-registration`, `check`.
- **Logic:** handlers in `Application/Auth/Commands` (`RegisterTenantCommand`, `LoginCommand`, `RefreshTokenCommand`, `VerifyLoginEmailOtpCommand`, `VerifyOtpCommand`, `ForgotPasswordCommand`, `VerifyResetOtpCommand`, `ResetPasswordCommand`, `SetupTotpCommand`, `VerifyTotpCommand`, `DisableTotpCommand`, …). `Infrastructure/Services/JwtTokenService` puts `sub`, `tid`, `email` and literal `role` claims in the token (`MapInboundClaims=false`). `TwoFactorOtpService` (SMS) reads its API key from `PlatformSettings` key `TwoFactor:ApiKey`. Emails via `EmailService` (Resend HTTP API, `Resend:ApiKey`, from `support@app.silarai.com`; without a key it only logs).
- **SuperAdmin accounts** are created only by `DataSeeder` on fresh DBs or `backend/scripts/add_superadmins.sql` (6 accounts on the `Silarai System` tenant) — no UI or API.

## Frontend
- **Routes & screens:** `pages/auth/` — `LoginPage` (tabs email / email-OTP, TOTP step), `RegisterPage` (form + email OTP step), `ForgotPasswordPage` (steps email → otp → password → done), `ResetPasswordPage`, `VerifyEmailPage`; `pages/settings/AccountSecurityPage.tsx` (Profile, Email Verification, Change Password, Two-Factor, Active Sessions).
- **Code:** `api/auth.api.ts`; `api/client.ts` (axios instance, Bearer header, single-flight refresh, `forceLogout()`); `store/auth.store.ts` (Zustand persist `silarai-auth`: tokens, user, `isAuthenticated`, `_hasHydrated`, `hasRole`); tokens are also copied to plain `localStorage` keys `accessToken` / `refreshToken` for the interceptor; `utils/deviceInfo.ts` (session device label).

## Known issues
Open items in [known-issues](known-issues.md): KI-001, KI-048, KI-053.

## Suggestions
- Require the TOTP code after email/phone OTP login when 2FA is enabled.
- Tokens are duplicated into plain `localStorage` keys for the axios interceptor; consider a single source.
- Remove the legacy SMS registration endpoints.

## Changes to be done
