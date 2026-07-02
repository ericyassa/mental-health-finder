import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: ["es2017", "edge88", "firefox78", "chrome87", "safari13"],
    cssTarget: ["chrome87", "edge88", "firefox78", "safari13"],
  },
  plugins: [
    react(),
    // Emit an additional legacy bundle + polyfills for older NHS trust browsers
    // (locked-down Edge Legacy / IE-mode / old Chrome). Only affects production build.
    mode !== "development" &&
      legacy({
        targets: ["defaults", "not IE 11", "edge >= 18", "chrome >= 70", "safari >= 12"],
        modernPolyfills: true,
        renderLegacyChunks: true,
      }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
