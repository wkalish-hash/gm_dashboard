import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Base path must match the proxy path for assets to load correctly
  // Update this to match your actual proxy path: /hyperhub-{workspace}/code/proxy/5173/
  base: '/hyperhub-wkalish-40purgatory-ski-basic-4453ce/code/proxy/5173/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow Shakudo host
    allowedHosts: ['mcp.hyperplane.dev'],
    // Disable HMR completely to avoid OAuth redirect issues in Shakudo environment
    hmr: false,
    // Prevent Vite from trying to connect via WebSocket
    ws: false,
    // Configure middleware to handle proxy path rewriting if needed
    middlewareMode: false,
    // Prevent any automatic redirects or connection attempts
    cors: false,
    // Disable source map to avoid additional requests
    sourcemap: false,
  },
  // Prevent Vite from injecting HMR client code
  define: {
    'import.meta.hot': 'undefined',
  },
})
