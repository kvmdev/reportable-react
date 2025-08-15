// src/types/environment.d.ts
// Augment ImportMetaEnv for Vite's environment variables
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  // Add other VITE_ prefixed environment variables here
  // readonly VITE_ANOTHER_VAR: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// If you still have Node.js specific code that uses process.env
// (e.g., for a backend or build scripts), you can keep this part:
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Add Node.js specific environment variables here
      // These are not exposed to the client-side via Vite directly
      NODE_ENV: 'development' | 'production' | 'test';
      // For example, if your backend uses a different API key
      // BACKEND_API_KEY: string;
    }
  }
}

export {};
