/// <reference types="vite/client" />

declare module '*.JPEG' {
  const src: string;
  export default src;
}

// Injected by vite.config.ts
declare const __SITE_URL__: string;
