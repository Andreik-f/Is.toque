import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Em desenvolvimento, as chamadas a /api vão para a API local. Para usar
  // outra API (ex.: a publicada), defina API_PROXY em .env.local.
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = {
    "/api": {
      target: env.API_PROXY || "http://localhost:8080",
      changeOrigin: true,
    },
  };
  return {
    // "@/..." aponta para src/ (ex.: "@/components/ui/button.jsx").
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: { proxy },
    preview: { proxy },
    // As duas imagens da tela de acesso (mascote.png e textura.jpg, cerca de
    // 210 KB) vão embutidas no pacote, para o protótipo de arquivo único
    // (documentação/ux/ISTOQUE-Prototipo.html) abrir sem servidor.
    build: { assetsInlineLimit: 200000 },
  };
});
