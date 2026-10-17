import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "web",
  server: {
    port: 5174,
    proxy: {
      // The slash keeps this from matching a module URL such as /api.ts.
      "/api/": "http://localhost:3040",
    },
  },
});
