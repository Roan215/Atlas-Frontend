import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Add this line to allow any ngrok URL
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Points to your Java Backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
