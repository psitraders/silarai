/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key for the Book a Demo form. Public by design. */
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
  /** WordPress base URL — dormant, see context.md. */
  readonly VITE_WORDPRESS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
