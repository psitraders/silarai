const API_BASE   = "https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net/api/v1";
const SWA_ORIGIN = "https://www.silarai.com";
const BOT_RE     = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|Googlebot|bingbot|DuckDuckBot/i;

/** Paths served directly from the backend (not the SPA) */
const BACKEND_PATHS = new Set(["/sitemap.xml", "/robots.txt", "/manifest.json", "/feed.xml", "/favicon.svg"]);

function escHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function metaHtml(store, pageUrl, slug) {
  const title = store.seoTitle || (store.name + " — Shop Online");
  const desc  = store.seoDescription || store.description || ("Shop at " + store.name + " on WhatsApp.");
  const img   = store.seoImage || store.bannerUrl || store.logoUrl || "";
  const favicon = store.faviconUrl || store.logoUrl
    || (API_BASE + "/public/" + encodeURIComponent(slug) + "/favicon.svg");
  let h = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" + escHtml(title) + "</title>";
  h += "<link rel=\"icon\" type=\"image/svg+xml\" href=\"" + escHtml(favicon) + "\">";
  h += "<meta name=\"description\" content=\"" + escHtml(desc) + "\">";
  h += "<meta property=\"og:site_name\" content=\"" + escHtml(store.name) + "\">";
  h += "<meta property=\"og:title\" content=\"" + escHtml(title) + "\">";
  h += "<meta property=\"og:description\" content=\"" + escHtml(desc) + "\">";
  h += "<meta property=\"og:url\" content=\"" + escHtml(pageUrl) + "\">";
  h += "<meta property=\"og:type\" content=\"website\">";
  if (img) h += "<meta property=\"og:image\" content=\"" + escHtml(img) + "\">";
  h += "<meta name=\"twitter:card\" content=\"summary_large_image\">";
  h += "<meta name=\"twitter:title\" content=\"" + escHtml(title) + "\">";
  h += "<meta name=\"twitter:description\" content=\"" + escHtml(desc) + "\">";
  if (img) h += "<meta name=\"twitter:image\" content=\"" + escHtml(img) + "\">";
  h += "<meta http-equiv=\"refresh\" content=\"0; url=" + escHtml(pageUrl) + "\">";
  h += "</head><body></body></html>";
  return h;
}

export default {
  async fetch(request) {
    const url  = new URL(request.url);
    const path = url.pathname;
    const ua   = request.headers.get("User-Agent") || "";

    // ── 1. Backend paths: sitemap, robots, manifest ───────────────────────────
    if (BACKEND_PATHS.has(path)) {
      const hostname = url.hostname;
      try {
        let slug = null;
        if (hostname === "www.silarai.com" || hostname === "silarai.com" || hostname === "cname.silarai.com") {
          const m = path.match(/^\/store\/([^/?#]+)/);
          if (m) slug = m[1];
        } else {
          const r = await fetch(API_BASE + "/public/resolve-domain?domain=" + encodeURIComponent(hostname), {
            headers: { "Accept": "application/json" },
            cf: { cacheTtl: 3600, cacheEverything: true },
          });
          if (r.ok) { const d = await r.json(); slug = d.slug; }
        }
        if (slug) {
          return fetch(API_BASE + "/public/" + encodeURIComponent(slug) + path);
        }
      } catch (_) {}
    }

    // ── 2. Bot detection: return OG meta HTML for crawlers ────────────────────
    if (BOT_RE.test(ua)) {
      try {
        const hostname = url.hostname;
        let slug = null;
        if (hostname === "www.silarai.com" || hostname === "silarai.com" || hostname === "cname.silarai.com") {
          const m = url.pathname.match(/^\/store\/([^/?#]+)/);
          if (m) slug = m[1];
        } else {
          const r = await fetch(API_BASE + "/public/resolve-domain?domain=" + encodeURIComponent(hostname), { headers: { "Accept": "application/json" } });
          if (r.ok) { const d = await r.json(); slug = d.slug; }
        }
        if (slug) {
          const r = await fetch(API_BASE + "/public/" + slug, { headers: { "Accept": "application/json" } });
          if (r.ok) {
            const store = await r.json();
            return new Response(metaHtml(store, url.href, slug), {
              headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" }
            });
          }
        }
      } catch (_) {}
    }

    // ── 3. Everything else: proxy to Azure SWA ────────────────────────────────
    const targetUrl = SWA_ORIGIN + path + url.search;
    const swaResp = await fetch(targetUrl, {
      method:   request.method,
      headers:  request.headers,
      body:     ["GET", "HEAD"].includes(request.method) ? null : request.body,
      redirect: "follow",
      cf: { cacheEverything: false, cacheTtl: 0 },
    });

    // Strip all Cloudflare edge caching — stale bundles break custom domain stores
    const newHeaders = new Headers(swaResp.headers);
    newHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");

    // Ensure HTML responses always declare UTF-8 so the browser never
    // misreads multi-byte characters (e.g. em-dash) as Latin-1 before JS loads
    const ct = newHeaders.get("Content-Type") || "";
    if (ct.includes("text/html") && !ct.includes("charset")) {
      newHeaders.set("Content-Type", "text/html; charset=utf-8");
    }

    return new Response(swaResp.body, { status: swaResp.status, headers: newHeaders });
  }
};
