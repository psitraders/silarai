// Vercel serverless function — proxies store-specific PWA manifest from the
// Azure backend to the Vercel domain.
//
// WHY: <link rel="manifest"> cross-origin fetches are made in "no-cors" mode
// by default, producing an opaque response Chrome cannot validate. Serving the
// manifest from the same Vercel origin removes that CORS barrier entirely and
// lets Chrome fire beforeinstallprompt → native install dialog.
//
// URL: /api/manifest/:slug  →  proxied from VITE_API_URL/public/:slug/manifest.json

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing slug' });
  }

  // VITE_API_URL is set in Vercel project env vars
  // e.g. https://replycartapi.azurewebsites.net/api/v1
  const apiBase = (process.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

  try {
    const upstream = await fetch(`${apiBase}/public/${slug}/manifest.json`, {
      headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream error' });
    }

    const data = await upstream.json();

    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[pwa-manifest] fetch failed:', err);
    return res.status(502).json({ error: 'Failed to fetch manifest from backend' });
  }
}
