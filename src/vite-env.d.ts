/// <reference types="vite/client" />


interface ImportMetaEnv {
    readonly VITE_API_TAKE: number;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }