import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // 后端端口可用 VITE_PROXY_TARGET 覆盖（默认 3100，与生产一致）
        target: process.env.VITE_PROXY_TARGET || "http://localhost:3100",
        changeOrigin: true,
      },
    },
  },
});
