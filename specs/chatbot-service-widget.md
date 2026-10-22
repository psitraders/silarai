---
id: chatbot-service-widget
status: current
prefix: CBS
related: [chatbot-service, chatbot-service-agent]
---
# Chatbot-as-a-Service — Embeddable Widget

## Purpose
A dependency-free vanilla-JS chat widget that any website embeds with one `<script>` tag to get the client's AI sales assistant, product carousel, cart, Razorpay / COD checkout — identified only by API key.

## Scope
- **In:** `frontend/public/chatbot-widget.js`, its Shadow-DOM UI, config, streaming client, cart mirror, variant gating, tests.
- **Out:** server behaviour (`chatbot-service-agent`), client setup and embed snippet (`chatbot-service`).

## Functional behaviour
- **Embed:** `window.RCChatbotConfig = { apiKey, apiBase?, position? (right | left), primaryColor?, accentColor? }` + `<script src="https://app.silarai.com/chatbot-widget.js" async>`. Without `apiBase` it falls back to the production Azure API URL (it has no build-time env). *Order now* pins the product in a focus strip (focused mode, `chatbot-service-agent`) until it is cleared.
- **UI:** launcher + teaser → panel with a single-row header (avatar, name, cart button with count, close); optional focused-product strip; grouped messages; product carousel (drag-to-scroll); product **detail** as a full in-panel overlay (hero image, variant grid, *Add to cart*, *Order now*, sticky Back bar); cart as a **bottom sheet** over the messages; auto-growing composer (Enter sends, Shift+Enter newline); Escape closes overlays / panel.
- **Streaming:** requests NDJSON and renders the server's *thinking* line, then the final reply; falls back to the single-JSON response.
- **Cart:** a read-only mirror of the server cart — every change round-trips `POST /chatbot/{apiKey}/cart` and re-renders what comes back. `sessionId` lives in `localStorage["rc_s_" + apiKey]` and is re-synced from the server.
- **Variants:** a product with variants can't be added or ordered in one tap — the card's *Add* opens the detail sheet; both detail buttons stay disabled (with a `.vrow.shake` cue) until a variant is chosen.
- **Order now** writes the cart directly (same `addToCart` call as *Add*) and only then sends a generic *"I'd like to checkout"* to the chat — the model never performs that write.
- **Checkout:** COD or Razorpay (key id from `config`), then `verify-payment`.

## Rules
- **CBS-R8** — The widget must stay backward compatible (legacy JSON and NDJSON responses; tolerate the `cart` key present or absent); deploys require cache-busting the embed URL.
- **CBS-R15** — Everything renders inside one open Shadow DOM on a full-viewport `position:fixed`, `pointer-events:none` host (only launcher, teaser and panel re-enable pointer events). Never give the host a `transform`; use `root.getElementById` / `root.querySelector`, not `document.*`.
- **CBS-R16** — No external requests besides the API (no web fonts); brand colours are host CSS variables (`--rc-primary` + precomputed `--rc-primary-a08/15/40/55`, computed in JS — no `color-mix()`).
- **CBS-R17** — Layout traps not to reintroduce: every child of the column-flex `.msgs` needs `flex:0 0 auto` (scroll containers otherwise collapse); carousel drag must not call `setPointerCapture` on `pointerdown` (it retargets the click and kills card buttons) — capture only after the drag threshold.
- CBS-R6 / CBS-R7 apply (variants, direct button writes).

## Backend
Uses `GET {apiKey}/config`, `POST {apiKey}/message`, `GET {apiKey}/products`, `GET|POST {apiKey}/cart`, `POST {apiKey}/orders/{id}/verify-payment` (`chatbot-service-agent`).

## Frontend
- **Code:** `frontend/public/chatbot-widget.js` (outside the Vite build, never type-checked).
- **Tests:** `frontend/test/chatbot-widget.test.mjs` — jsdom against a mocked API: shadow-root isolation, NDJSON streaming, thinking line, card values, cart flow, Escape, non-streaming fallback. Run `npm install --no-save jsdom && node test/chatbot-widget.test.mjs`. This is the widget's only automated coverage.

## Known issues
None open — see [known-issues](known-issues.md).

## Suggestions
- Version the embed URL (e.g. `chatbot-widget.js?v=`) in the generated snippet so deploys don't depend on manual cache-busting.

## Changes to be done
