---
id: storefront-accounts
status: current
prefix: SF
related: [storefront, crm-customers, b2b-wholesale]
---
# Storefront Customer Accounts

## Purpose
Shoppers create an account on a store to see their orders, keep a wishlist and — as business buyers — get wholesale prices and request quotes.

## Scope
- **In:** `StorefrontCustomer`, register / login, profile, my orders, wishlist, my quotes, B2B sign-up fields, link to the CRM customer, the account modal and panel.
- **Out:** B2B approval and quote handling by the merchant (`crm-customers`, `b2b-wholesale`), dashboard auth (`auth-identity`).

## Functional behaviour
- **Sign up / sign in** (`CustomerAuthModal` from the header / shell): name, email, password, phone; optional *business buyer* with company and GST number. Accounts are per store (same email can exist in two stores).
- Registration finds or creates the store's CRM customer by email (tag `b2b` for business buyers) and links it (`LinkedCrmCustomerId`); B2B buyers start **unapproved** until the merchant approves them (`crm-customers`).
- **My account** (`MyAccountPanel`): tabs *Orders* (orders linked to the CRM customer, else matched by phone), *Wishlist* (toggle from product cards / pages; shows image, price), *Quotes* (only for B2B buyers when B2B is on), *Profile*; loyalty points are displayed when > 0.
- Approved B2B buyers see wholesale tier prices and can request quotes; checkout sends their token so the server applies tier prices (`orders-checkout`).

## Rules
- **SF-R3** — Storefront customer auth is separate from dashboard auth (INV-4, INV-5).
- **SF-R8** — A storefront token is a JWT with role `StorefrontCustomer` and the store's `tid`; storefront customer endpoints require that role and only return the caller's own data.
- **SF-R9** — B2B prices apply only when the server confirms `IsB2BCustomer && IsB2BApproved` from the token, never from a client flag.

## Backend
- **Data:** `Storefront/StorefrontCustomer` (`Name`, `Email`, `PasswordHash` [BCrypt], `PhoneNumber`, `Address`, `City`, `State`, `PinCode`, `IsB2BCustomer`, `IsB2BApproved`, `CompanyName`, `GstNumber`, `LoyaltyPoints`, `LinkedCrmCustomerId`), `StorefrontWishlistItem` (`StorefrontCustomerId`, `ProductId`).
- **API — `StorefrontCustomerController` `/api/v1/public/{slug}/customer`:** `POST register`, `POST login` (both anonymous → `{accessToken, customerId, name, email, isB2BCustomer, isB2BApproved, loyaltyPoints}`), `GET profile`, `GET orders`, `GET wishlist`, `POST wishlist/{productId}` (toggle → `{isNowWishlisted, totalWishlistCount}`), `GET quotes` (all `[Authorize(Roles = "StorefrontCustomer")]`).
- **Logic:** `Application/Storefront/Commands/StorefrontAuthCommands` (register / login, CRM link), `WishlistCommands`, `Queries/StorefrontCustomerQueries` (profile, orders by linked customer or phone digits), `QuoteCommands.GetMyQuotesQuery`. Token from `JwtTokenService.GenerateAccessToken` (same lifetime as dashboard access tokens, `Jwt:AccessTokenExpiryMinutes` = 15; no refresh token).

## Frontend
- **Code:** `context/StorefrontAuthContext.tsx` (per-store `localStorage` key `sf_customer_{slug}`, migrates the old `sessionStorage` key; `useCustomerApi(slug)` axios calls with the customer bearer, outside the dashboard refresh client), `components/storefront/CustomerAuthModal.tsx`, `MyAccountPanel.tsx`; shell wiring in `storefront-builder/shell/StoreShell.tsx` (`useShell().auth / account / wishlist`).

## Known issues
Open items in [known-issues](known-issues.md): KI-033, KI-034.

## Suggestions
- Issue a longer-lived storefront token (or a refresh flow) and log out on 401.

## Changes to be done
