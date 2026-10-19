import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: { port: 4321, host: "127.0.0.1" },
  build: {
    rollupOptions: {
      external: ["three", /^three\/addons\//],
    },
  },
});
