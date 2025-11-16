import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Base path for Shakudo proxy setup
  // Use '/' for dev (Shakudo proxies through /proxy/5173/), '/gm_dashboard/' for production build
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Disable HMR completely to avoid OAuth redirect issues in Shakudo environment
    hmr: false,
    // Prevent Vite from trying to connect via WebSocket
    ws: false,
  },
  // Prevent Vite from injecting HMR client code
  define: {
    'import.meta.hot': false,
  },
})
