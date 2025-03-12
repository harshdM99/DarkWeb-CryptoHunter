import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // ✅ Ensures Vite is accessible from inside Docker
    port: 5173, // ✅ Ensures it's running on the right port
    strictPort: true,
    watch: {
      usePolling: true, // ✅ Helps with file change detection in Docker
    },
    hmr: {
      clientPort: 5173, // ✅ Ensures WebSocket works inside Docker
    },
  },
});
