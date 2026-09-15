/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** WordPress base URL — dormant, see context.md. */
  readonly VITE_WORDPRESS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
