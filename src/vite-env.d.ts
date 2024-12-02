/// <reference types="vite/client" />


interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_SKIP_AUTH: boolean | string;
    readonly VITE_API_TAKE: number;
    readonly VITE_AUTH_COOKIE_NAME: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }