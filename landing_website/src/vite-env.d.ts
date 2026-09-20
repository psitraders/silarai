/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** WordPress base URL — dormant, see context.md. */
  readonly VITE_WORDPRESS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}
