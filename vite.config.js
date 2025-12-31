import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    port: 5173,
    historyApiFallback: true,
    hmr: {
      overlay: false, // ✅ Optional: disable error overlay
    },
  },
  // ✅ ADD: Preserve state during HMR
  optimizeDeps: {
    exclude: ["pinia"], // Don't optimize pinia to preserve state
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.{test,spec}.{js,ts,vue}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.js"],
    },
  },
});