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
    // Proxy API requests to n8n to avoid CORS issues
    proxy: {
      '/api/n8n': {
        target: 'https://n8n-v2.mcp.hyperplane.dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        // Forward cookies and headers for OAuth2 authentication
        cookieDomainRewrite: {
          // Rewrite cookie domain to allow forwarding
          '*': '',
        },
        // Preserve cookies from the original request
        cookiePathRewrite: {
          // Keep original path
          '*': '',
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
            // Log cookies being forwarded (for debugging)
            if (req.headers.cookie) {
              console.log('Forwarding cookies:', req.headers.cookie.substring(0, 100) + '...');
            } else {
              console.warn('No cookies found in request - authentication may fail');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Log response status for debugging
            console.log('Proxy response status:', proxyRes.statusCode, 'for', req.url);
          });
        },
      },
    },
  },
  // Prevent Vite from injecting HMR client code
  define: {
    'import.meta.hot': 'undefined',
  },
})
