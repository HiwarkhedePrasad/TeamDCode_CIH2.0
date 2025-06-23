import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    allowedHosts:
      "https://c66a-2409-40c2-3f-fcdd-280b-8ccd-42f3-ae6b.ngrok-free.app",
  },
});
