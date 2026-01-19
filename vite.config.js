import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Plugin to replace localDataTransformers with stub in production builds
// This prevents build errors from missing data folder imports
const useStubInProduction = () => {
  return {
    name: 'use-stub-in-production',
    resolveId(id, importer) {
      // Only in production builds
      if (process.env.NODE_ENV !== 'production') {
        return null
      }
      
      // Check if this is an import of localDataTransformers (not the stub itself)
      if (id.includes('localDataTransformers') && !id.includes('stub')) {
        // Check if it's a relative import from the utils directory
        const isRelativeImport = id.startsWith('.') || id.startsWith('../')
        const isLocalDataTransformers = id.includes('localDataTransformers')
        
        if (isRelativeImport && isLocalDataTransformers) {
          // Resolve to the stub file instead
          return resolve(__dirname, 'src/utils/localDataTransformers.stub.js')
        }
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Base path must match the deployment path for assets to load correctly
  // For direct domain deployment (https://gm-dashboard.mcp.hyperplane.dev/), use root path
  base: '/',
  plugins: [react(), tailwindcss(), useStubInProduction()],
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
  // Exclude data folder from optimization to prevent build errors when data folder is not present
  optimizeDeps: {
    exclude: ['**/data/**'],
  },
  // Preview server configuration (for production)
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Disable HMR in preview mode
    hmr: false,
    // Disable WebSocket
    ws: false,
  },
})
