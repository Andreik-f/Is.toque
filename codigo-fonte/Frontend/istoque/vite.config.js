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
    // Imagens de até 200000 bytes (cerca de 195 KB) vão embutidas no pacote
    // (mascote.png e textura-cadastro.svg, usada só no painel do cadastro).
    // textura.jpg, com cerca de 583 KB, passa do limite e sai como arquivo
    // separado em dist/assets. Este build não gera o arquivo único do
    // protótipo (documentação/ux/ISTOQUE-Prototipo.html).
    build: { assetsInlineLimit: 200000 },
  };
});
