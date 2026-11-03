import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Build-only HTML optimisations, adapted from the AI Studio export's
// staticDiscoveryPlugin. The export's dev/preview middleware (301 redirects,
// /api/* JSON shim, /seo-meta-table) is deliberately not ported: Azure SWA
// never runs it, and the site serves knowledge files from /ai/*.json.
function htmlPerformancePlugin(): Plugin {
  return {
    name: 'silarai-html-performance',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      // 1. Load the main stylesheet without blocking first paint.
      html = html.replace(
        /<link\s+rel="stylesheet"(?:\s+crossorigin)?\s+href="(\/assets\/[^"]+\.css)">/g,
        `<link rel="preload" as="style" href="$1" />\n    <link rel="stylesheet" href="$1" media="print" onload="this.media='all'" />\n    <noscript><link rel="stylesheet" href="$1" /></noscript>`
      );

      // 2. Preload the hero (LCP) image.
      if (ctx?.bundle) {
        const hero = Object.keys(ctx.bundle).find(
          (fileName) => fileName.includes('shopping_assistant_ui') && fileName.endsWith('.webp')
        );
        if (hero) {
          html = html.replace(
            '</head>',
            `    <link rel="preload" as="image" href="/${hero}" fetchpriority="high" type="image/webp" />\n  </head>`
          );
        }
      }

      // 3. Inline base colours/typography so the page does not flash unstyled
      //    while the non-blocking stylesheet loads. Mirrors src/index.css base layer.
      const criticalCss = `
    <style id="critical-theme">
      html {
        scroll-behavior: smooth;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: #183a47;
        background-color: #F8F9FA;
      }
      body {
        margin: 0;
        background-color: #F8F9FA;
        color: #183a47;
        -webkit-font-smoothing: antialiased;
      }
    </style>`;
      html = html.replace('</head>', `${criticalCss}\n  </head>`);

      return html;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), htmlPerformancePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
