---
id: auth-team
status: current
prefix: AUTH
related: [auth-identity, tenancy-plans]
---
# Team (Business Admins)

## Purpose
Lets the store owner give other people full dashboard access as **Business Admins**, invited by email, without sharing the owner account.

## Scope
- **In:** invite, resend invite, accept invite (set password), deactivate / reactivate, team list, what a Business Admin may and may not do.
- **Out:** login and sessions themselves (`auth-identity`), plan changes (`tenancy-plans`).

## Functional behaviour
- **Team** page (`/settings/team`, owner only, sidebar *Team*): list of the tenant's dashboard users (owner first) with role, status (*Active* / *Invited* / *Deactivated*), created and last login.
- **Invite:** owner enters name + email → a user is created with the `BusinessAdmin` role and an unusable random password, and an email with a link to `/accept-invite?token=…` is sent (link valid 7 days). Status is *Invited* until accepted.
- **Accept invite** (`/accept-invite`, public): the invitee sets a password (≥ 8 chars); this also verifies their email. They then log in normally.
- **Resend invite:** only for active, not-yet-accepted admins; previous links stop working.
- **Deactivate / reactivate:** deactivation blocks login and revokes all refresh tokens (the current access token still works ≤ 15 min).
- A Business Admin sees the whole dashboard except *Team* and the change-plan card on *Subscription*.

## Rules
- **AUTH-R7** — A `BusinessAdmin` has the same tenant access as the `TenantAdmin` except managing admins and changing the plan (TEN-R6).
- **AUTH-R8** — Only the `TenantAdmin` manages Business Admins: invite by email link (expires in 7 days; accepting sets the password and verifies the email), resend invite, deactivate / reactivate. The owner account cannot be managed there. Deactivation revokes the admin's sessions. No limit on the number of admins for now (`MaxStaffUsers` is display-only).
- **AUTH-R12** — Invitee emails must be globally unused (one email = one user, AUTH-R9); an existing user of another tenant cannot be invited.

## Backend
- **Data:** `User` + `UserRole` (`BusinessAdmin`), `UserToken` (`Type = Invitation`, hashed, 7 days, `IsUsed`).
- **API — `TeamController` `/api/v1/team`, `[Authorize(Roles = "TenantAdmin")]`:** `GET` (members), `POST invite {name, email}` → member, `POST {userId}/resend-invite`, `PUT {userId}/status {isActive}`. `POST /auth/accept-invite {token, password}` is anonymous (`AuthController`).
- **Logic:** `Application/Team/Commands/BusinessAdminCommands.cs` (`InviteBusinessAdminCommand`, `ResendBusinessAdminInviteCommand`, `SetBusinessAdminStatusCommand`, helper `TeamInvites` — 48-byte URL-safe token, `FindBusinessAdminAsync` refuses non-BusinessAdmin targets with 403), `Team/Queries/GetTeamMembersQuery.cs` (status derivation), `Auth/Commands/AcceptInviteCommand.cs`. Invite email: `EmailService.SendBusinessAdminInviteAsync` (store name + inviter name). `/api/v1/team` is on the Basic-plan allow-list (TEN-R5). `SubscriptionsController.SelectPlan` rejects `BusinessAdmin`.

## Frontend
- **Routes & screens:** `pages/settings/TeamPage.tsx` behind `TenantAdminGuard` (others are redirected to `/dashboard`); `pages/auth/AcceptInvitePage.tsx`.
- **Code:** `api/team.api.ts` (`list`, `invite`, `resendInvite`, `setStatus`); `Sidebar.tsx` adds *Team* only for `TenantAdmin`; `SubscriptionPage` hides the change-plan card for `BusinessAdmin`.

## Known issues
Open items in [known-issues](known-issues.md): KI-022.

## Suggestions
- Allow removing (not only deactivating) an admin who never accepted the invite.

## Changes to be done
