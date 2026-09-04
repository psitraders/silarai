# Deployment Runbook — Azure Static Web Apps + silarai.com cutover

Moves the landing site to Azure Static Web Apps on `silarai.com`.

> **Status (2026-09-04): cutover is live.** `silarai.com` resolves via Cloudflare
> DNS (CNAME-flattened at the apex) to the `black-mushroom` Azure Static Web App and
> serves the correct site. **The WordPress blog was retired, not migrated** — it is
> no longer part of this deployment. `blog.silarai.com` still has a stale DNS record
> pointing at the old Hostinger box; it can be deleted. The `/blog*`, `/wp-content*`,
> `/wp-admin*`, `/wp-login.php` and `/feed*` redirect rules have been **removed** from
> `public/staticwebapp.config.json` — Phase 2 and Phase 5 below are kept only as
> history and no longer apply. See `changes.md` (2026-09-04 entries).
>
> **Two DNS gaps found after cutover, still open:**
> - No MX record for `silarai.com` — mail to `info@silarai.com` (where Web3Forms
>   sends demo-request leads) cannot be delivered. Needs an MX record from whatever
>   host serves that inbox — the `hostingermail-a/b/c` DKIM CNAMEs already in the
>   zone suggest Hostinger Email.
> - `www.silarai.com` does not resolve (NXDOMAIN). Add a `CNAME www` → the SWA
>   hostname, same as `silarai.com`'s own CNAME, and set it to redirect to the apex
>   in Azure's Custom domains settings (canonical URL is the apex, per `index.html`).

**Read the whole document before starting** if you are redoing any part of this from
scratch. The ordering below was deliberate for the original migration — it kept
WordPress reachable throughout and made every step reversible.

---

## Target end state

| Hostname | Serves | DNS record |
|---|---|---|
| `silarai.com` | This landing site (Azure SWA) | `CNAME @` → SWA hostname (Cloudflare flattens the apex) |
| `www.silarai.com` | Redirect → apex | `CNAME www` → SWA hostname — **not yet added, see status note above** |
| `app.silarai.com` | Existing Azure SWA (the product dashboard) | unchanged |
| `stage.silarai.com` | Existing Azure SWA | unchanged |
| Email | Hostinger, unchanged | **MX record missing — see status note above** |

`blog.silarai.com` / WordPress is retired and intentionally absent from this table.

---

## Phase 0 — Before you touch anything

- [ ] **Export the DNS zone.** Hostinger → DNS / Nameservers → **Export** (top right). Keep the file until the cutover is confirmed. This is your rollback.
- [ ] **Confirm the full record list.** The zone view may be truncated. You have Hostinger DKIM, `autodiscover` and `autoconfig` records but no visible **MX or SPF TXT for the root domain**. Those must exist for `info@silarai.com` to receive mail — which is where demo requests land. If they are genuinely missing, root email is already broken and needs fixing independently.
- [ ] **Inventory ranking blog URLs.** Search Console → Pages, or `silarai.com/sitemap_index.xml` from WordPress. You need these for Phase 5 redirects.
- [ ] **Note your current WordPress admin access** — you will need it in Phase 2.

**Never touch these records.** Deleting any of them breaks email or your existing Azure apps:

```
CNAME  hostingermail-a._domainkey    Hostinger DKIM
CNAME  hostingermail-b._domainkey    Hostinger DKIM
CNAME  hostingermail-c._domainkey    Hostinger DKIM
CNAME  autodiscover                  mail client autodiscovery
CNAME  autoconfig                    mail client autoconfig
TXT    resend._domainkey.app         Resend DKIM (app subdomain)
TXT    send.app                      SES SPF
MX     send.app                      SES bounce handling
CNAME  app                           existing Azure SWA
CNAME  stage                         existing Azure SWA
```

Only **two** records change: `A @` and `CNAME www`. One is added: `A blog`.

---

## Phase 1 — Get the code into GitHub

The repo is not currently under version control.

```bash
cd D:\work\silarai\landing_website
git init
git add .
git commit -m "Static Azure build: remove server, add discovery generator"
git branch -M main
git remote add origin https://github.com/<your-org>/silarai-landing.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `dist/` and `.env*` (keeping `.env.example`).
Confirm no real Web3Forms key is committed.

> No GitHub? You can deploy with the SWA CLI instead — see *Appendix A*.

---

## Phase 2 — Move WordPress to blog.silarai.com (RETIRED — do not follow)

> This phase is kept for history only. The WordPress blog was retired rather than
> migrated; `blog.silarai.com` is not part of the current deployment. Skip to Phase 3.

**Do this first, while `silarai.com` still points at WordPress.** If you flip DNS first,
the blog goes dark until this is finished.

### 2.1 Add the DNS record for the subdomain

In Hostinger → DNS / Nameservers → Manage DNS records:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `blog` | `94.136.187.227` | 300 |

Wait for it to resolve (usually a few minutes at TTL 300):

```bash
nslookup blog.silarai.com
```

### 2.2 Point the subdomain at the existing WordPress install

> ⚠️ **The single most dangerous step in this runbook.** Hostinger's Add Subdomain
> flow creates a **new, empty document root** by default (`domains/blog.silarai.com/public_html/`).
> If you accept that default, `blog.silarai.com` serves an empty directory listing
> showing only `cgi-bin/` — and step 2.3 will then redirect your live site into it.

In Hostinger **hPanel** → Websites → Subdomains:

- Add `blog.silarai.com`, and **enable the "Custom folder for subdomain" option**.
- Set the folder to the **existing WordPress directory** — the one containing `wp-config.php` and `wp-content/`, usually `domains/silarai.com/public_html`.
- Issue an **SSL certificate** for `blog.silarai.com` (hPanel → SSL). Wait for it to go active.

**Verify before continuing:** `https://blog.silarai.com` must load your WordPress
site. If you see a directory listing with only `cgi-bin/`, the document root is
wrong — delete the subdomain and re-create it with the custom folder set. Do not
proceed until WordPress renders.

At this point both `silarai.com` and `blog.silarai.com` serve the same WordPress
install. That is correct and expected.

### 2.3 Tell WordPress its new address

WordPress stores its own URL in the database. If you skip this, WordPress will 301
every visitor back to `silarai.com` — which by then points at Azure — producing an
infinite redirect loop.

**Set it in `wp-config.php`, not in the admin UI.** The admin UI writes to the
database, which is hard to reverse once the site stops loading. Constants in
`wp-config.php` override the database and can be undone with one file edit.

hPanel → File Manager → your WordPress folder → `wp-config.php`. Add above the
line `/* That's all, stop editing! Happy publishing. */`:

```php
define('WP_HOME', 'https://blog.silarai.com');
define('WP_SITEURL', 'https://blog.silarai.com');
```

**Only do this after 2.2 verifies.** Changing WordPress's address before the new
hostname serves WordPress takes both sites down at once.

#### Recovery: if both sites are down

Symptoms: `silarai.com` redirects to `blog.silarai.com`, and `blog.silarai.com`
shows a directory listing with only `cgi-bin/`.

Cause: 2.3 was applied while the subdomain still pointed at an empty folder.

Fix: edit `wp-config.php` and point the constants back at the apex —

```php
define('WP_HOME', 'https://silarai.com');
define('WP_SITEURL', 'https://silarai.com');
```

The site returns immediately. Then redo 2.2 correctly before retrying 2.3.
No data is lost; only the site URL was ever changed.

### 2.4 Rewrite URLs stored inside content

Post bodies, image `src` attributes and internal links still contain
`https://silarai.com/...`. Fix with the **Better Search Replace** plugin
(Tools → Better Search Replace), or WP-CLI:

```bash
wp search-replace 'https://silarai.com' 'https://blog.silarai.com' --all-tables --dry-run
# review the output, then run for real without --dry-run
```

Run a dry run first. Take a database backup before the real run.

### 2.5 Verify before moving on

- [ ] `https://blog.silarai.com` loads **WordPress**, not a directory listing
- [ ] Valid SSL certificate on the subdomain
- [ ] A blog post loads, with images
- [ ] `wp-admin` login works
- [ ] No redirect back to `silarai.com`

**Do not proceed until all four pass.** At this point WordPress is reachable at
*both* `silarai.com` and `blog.silarai.com`, which is exactly what you want.

---

## Phase 3 — Create the Azure Static Web App

> ⚠️ Create a **new** Static Web App. Do not reuse `lemon-sea-09c8e5a00.7.azurestaticapps.net` — that one already serves `app.silarai.com` and `stage.silarai.com`.

Azure Portal → **Create a resource** → **Static Web App**:

| Setting | Value |
|---|---|
| Name | `silarai-landing` |
| Plan type | **Standard** if you later want a linked backend; **Free** is fine for this site |
| Region | closest to your audience |
| Deployment source | GitHub → authorise → select your repo, branch `main` |
| Build presets | **Custom** |
| App location | `/` |
| Api location | *(leave empty)* |
| Output location | `dist` |

Azure commits a workflow to `.github/workflows/`. **Edit it to inject the form key at
build time** — Vite inlines `VITE_*` variables during the build, so it must be present
in CI, not at runtime:

```yaml
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        env:
          VITE_WEB3FORMS_ACCESS_KEY: ${{ secrets.VITE_WEB3FORMS_ACCESS_KEY }}
          SITE_URL: https://silarai.com
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: upload
          app_location: "/"
          api_location: ""
          output_location: "dist"
```

Add the secret in GitHub → Settings → Secrets and variables → Actions →
`VITE_WEB3FORMS_ACCESS_KEY`. Get the key from [web3forms.com](https://web3forms.com)
using the address that should receive demo requests.

**Verify on the default hostname before going near DNS:**

- [ ] `https://<generated-name>.azurestaticapps.net` loads the landing page
- [ ] Deep link works: `/industries/manufacturing` returns the page, not a 404
- [ ] `/llms.txt` returns plain text, **not** the HTML shell
- [ ] `/sitemap.xml` returns XML with ~50 URLs
- [ ] `/ai/discovery.json` returns JSON
- [ ] Submitting the demo form delivers an email

That last one is the real test of the Web3Forms wiring. If the form shows an error,
the build did not receive the key.

---

## Phase 4 — DNS cutover

Only now do you move the apex. Both `silarai.com` and `blog.silarai.com` currently
serve WordPress, so nothing is down.

### 4.1 Validate domain ownership with Azure

Azure Portal → your Static Web App → **Custom domains** → **Add**:

1. Enter `silarai.com`, choose the **apex / TXT validation** option.
2. Azure generates a TXT record. **Copy the host and value exactly as displayed** — the host string varies, and guessing it is the most common reason validation hangs.
3. Add that TXT record in Hostinger.
4. Wait for Azure to report the domain validated. This can take 10–60 minutes.

### 4.2 Swap the two WordPress records

Only after validation succeeds:

| Action | Type | Name | Value |
|---|---|---|---|
| **Delete** | A | `@` | `94.136.187.227` |
| **Add** | ALIAS | `@` | `<your-swa>.azurestaticapps.net` |
| **Edit** | CNAME | `www` | change `silarai.com` → `<your-swa>.azurestaticapps.net` |

Hostinger supports **ALIAS** records, which is what makes this work — DNS forbids a
CNAME at the zone apex because it would conflict with the SOA, NS and MX records.
An ALIAS resolves the target to its IP at query time, so the apex keeps working
alongside your mail records.

Only one ALIAS record is allowed per zone. If one already exists, edit it rather than
adding a second.

### 4.3 Add www in Azure

Custom domains → Add → `www.silarai.com`. A subdomain can validate by CNAME, which
you already created above. Then set **www to redirect to the apex** — `index.html`
declares `https://silarai.com/` as canonical, so the apex must win.

TTLs are 300 seconds, so propagation is minutes and rollback is cheap.

---

## Phase 5 — Blog redirects (RETIRED — do not follow)

> Kept for history only. The blog redirect routes below were **removed** from
> `public/staticwebapp.config.json` on 2026-09-04 when the WordPress blog was
> retired. Skip to Phase 6.

`public/staticwebapp.config.json` used to redirect these to the blog subdomain:

```
/blog*        → https://blog.silarai.com
/wp-content*  → https://blog.silarai.com
/wp-admin*    → https://blog.silarai.com/wp-admin
/wp-login.php → https://blog.silarai.com/wp-login.php
/feed*        → https://blog.silarai.com/feed
```

**These do not preserve the deep path.** Azure Static Web Apps route redirects do not
interpolate the wildcard segment into the destination, so `silarai.com/blog/my-post`
lands on the blog home page, not on `my-post`. For a handful of pages that is a minor
SEO loss; for a blog with real traffic it is not.

Two ways to do better:

**Explicit rules for URLs that matter.** Exact-path redirects work correctly. Add one
route per ranking URL:

```json
{ "route": "/blog/ai-commerce-guide", "redirect": "https://blog.silarai.com/blog/ai-commerce-guide", "statusCode": 301 }
```

Give me your Search Console URL list and I will generate these.

**Cloudflare in front, for a long tail.** Move nameservers to Cloudflare (free) and use
Bulk Redirects, which support wildcard path preservation. Worth it above roughly
30–50 URLs.

Also update the WordPress permalink structure if your posts previously lived at the
site root (`silarai.com/my-post` rather than `silarai.com/blog/my-post`) — the rules
above assume a `/blog/` prefix.

---

## Phase 6 — Post-cutover verification

```bash
# Apex and www resolve to Azure
nslookup silarai.com
nslookup www.silarai.com

# Knowledge files serve with correct content types, not the SPA shell
curl -sI https://silarai.com/llms.txt      | grep -i content-type   # text/plain
curl -sI https://silarai.com/sitemap.xml   | grep -i content-type   # application/xml
curl -s  https://silarai.com/ai/discovery.json | head -5

# Deep link returns the app, not a 404
curl -sI https://silarai.com/industries/manufacturing | head -1
```

Checklist:

- [x] `https://silarai.com` serves the landing site with a valid certificate — confirmed live 2026-09-04
- [ ] `https://www.silarai.com` redirects to the apex — **not yet resolvable, add the CNAME (see status note above)**
- [ ] **Add an MX record for `silarai.com` and confirm `info@silarai.com` can receive mail** — currently missing, demo-request leads cannot be delivered
- [x] `https://app.silarai.com` responds correctly — confirmed live 2026-09-04
- [ ] Submit the demo form end to end and confirm delivery — blocked on the MX fix above
- [ ] Restrict the Web3Forms key to `silarai.com` in the Web3Forms dashboard
- [ ] Resubmit `https://silarai.com/sitemap.xml` in Search Console
- [ ] Delete the stale `blog.silarai.com` DNS record (WordPress retired, no longer served)

The email check matters most. Nothing in this runbook should affect mail, but a
mistyped record in the zone editor is easy to make and slow to notice.

---

## Rollback

If the site misbehaves after cutover, note WordPress itself was retired (not kept
warm on `blog.silarai.com`), so rollback no longer restores a working WordPress site
— it only points the apex back at the old Hostinger IP, which by now likely serves
nothing useful either. Reverting the Azure SWA deployment (previous GitHub Actions
run, or `swa deploy` with an older `dist/`) is the safer rollback path today.

Historical DNS-level rollback, if ever needed:

1. Delete the apex CNAME (`silarai.com` → the SWA hostname).
2. Re-add `A @` → `94.136.187.227` (old Hostinger box — confirm it still serves
   something before relying on this).
3. Remove or revert `CNAME www`.

---

## Appendix A — Deploying without GitHub

```bash
npm install -g @azure/static-web-apps-cli
npm run build
swa deploy ./dist --deployment-token <token-from-azure-portal> --env production
```

Get the token from Azure Portal → your Static Web App → **Manage deployment token**.
Set `VITE_WEB3FORMS_ACCESS_KEY` in a local `.env` before `npm run build`, since the
value is baked into the bundle at build time.

---

## Appendix B — Reviving the WordPress integration

With WordPress at a stable `blog.silarai.com`, the dormant clients in `src/lib/`
become usable again. They currently call `/api/wordpress/*` proxy routes that no
longer exist. To re-enable, either allow CORS from `silarai.com` on the WordPress
host and call `wp-json` directly, or proxy through the existing .NET backend.

See `context.md` §4.6.
