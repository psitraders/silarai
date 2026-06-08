import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const PROD_API = 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net/api/v1';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || PROD_API),
  },
  server: {
    port: 5173,
    proxy: {
      // API calls
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Uploaded product images served from backend wwwroot
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Raise the chunk size warning threshold (we're splitting manually below)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime — tiny, always needed, cache forever
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // React Router
          if (id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          // Axios
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
          // Lucide icons — large, rarely changes
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Framer Motion — large animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Zustand state management
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          // Recharts / charting — only used in analytics / dashboard
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-')) {
            return 'vendor-charts';
          }
          // Storefront pages — public facing, split from dashboard
          if (id.includes('/pages/storefront/') ||
              id.includes('/context/CartContext')) {
            return 'chunk-storefront';
          }
          // Landing / legal / marketing pages — only needed pre-auth
          if (id.includes('/pages/landing/') ||
              id.includes('/pages/legal/') ||
              id.includes('/pages/subscription/PricingPage')) {
            return 'chunk-landing';
          }
          // Admin pages — only for super-admins
          if (id.includes('/pages/admin/') ||
              id.includes('/pages/b2b/')) {
            return 'chunk-admin';
          }
          // AI tools — heavy, rarely used on first visit
          if (id.includes('/pages/ai/')) {
            return 'chunk-ai';
          }
          // Marketing pages
          if (id.includes('/pages/marketing/')) {
            return 'chunk-marketing';
          }
          // Analytics
          if (id.includes('/pages/analytics/')) {
            return 'chunk-analytics';
          }
        },
      },
    },
  },
})
