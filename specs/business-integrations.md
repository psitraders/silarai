---
id: business-integrations
status: current
context: "§4.3 Business, §4.4, §5.4"
---
# Business Profile & Integrations

## Purpose
The merchant's store profile and the credentials that connect it to messaging channels, payment gateways and AI auto-reply.

## Scope
- **In:** `Business` profile, `SocialLink`, WhatsApp/Instagram/Facebook and Razorpay/Stripe/PayPal credentials, AI auto-reply config, onboarding wizard, QR code tool.
- **Out:** storefront look & SEO (`storefront`), message handling (`channels-inbox`), payments at checkout (`orders-payments`).

## Rules
- **BIZ-R1** — Channel and payment credentials are per tenant and stored on the `Business` entity.
- **BIZ-R2** — `business` routes stay reachable on the `basic` plan (TEN-R5).
- See INV-6 (platform secrets never in `appsettings.json`).

## UI
- `pages/settings/` — BusinessProfilePage, IntegrationsPage.
- `components/onboarding/OnboardingWizard.tsx` — first-run setup with completion score.
- `pages/tools/QrGeneratorPage.tsx`.

## Suggestions
- Check whether per-tenant secrets on `Business` are encrypted at rest; if not, consider it.

## Changes to be done
