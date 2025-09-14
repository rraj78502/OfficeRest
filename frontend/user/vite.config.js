import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react(), tailwindcss()],
});
