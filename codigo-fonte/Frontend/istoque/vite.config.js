import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  // "@/..." aponta para src/ (ex.: "@/components/ui/button.jsx").
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // Keep the two small auth assets available in the offline review artifact.
  build: { assetsInlineLimit: 200000 },
});
