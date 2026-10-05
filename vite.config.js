import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

/**
 * Vite configuration for ShayanaBroadhub.
 *
 * - React + Tailwind CSS 4 (via the official Vite plugin, no PostCSS config needed).
 * - `@` alias points at `src/` for clean, refactor-safe imports.
 * - Dev/preview servers bind to 0.0.0.0:3000 so the app is reachable
 *   through the sandbox preview gateway as well as locally.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    // Dev-only API proxy: forwards /api/* to the local Express
    // runner (npm run dev:server on :3001). On Vercel, /api/*
    // is handled natively by the serverless function.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    watch: {
      // Sandbox-only directories — not part of the app.
      ignored: ["**/skills/**", "**/upload/**", "**/download/**", "**/dist/**"],
    },
  },
  // Restrict dependency pre-bundling scan to the real entry point so
  // stray HTML files in sandbox folders never break the optimizer.
  optimizeDeps: {
    entries: ["index.html"],
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
