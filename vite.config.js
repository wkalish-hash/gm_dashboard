import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   proxy: {
  //     '/api/webhook': {
  //       target: 'https://n8n.mcp.hyperplane.dev',
  //       changeOrigin: true,
  //       secure: true,
  //       rewrite: (path) => path.replace(/^\/api/, ''),
  //        cookieDomainRewrite: '',
  //       configure: (proxy, _options) => {
  //         proxy.on('error', (err, _req, _res) => {
  //           console.log('proxy error', err);
  //         });
  //         proxy.on('proxyReq', (proxyReq, req, _res) => {
  //           console.log('Sending Request to the Target:', req.method, req.url);
  //           // Forward any authorization headers
  //           if (req.headers.authorization) {
  //             proxyReq.setHeader('Authorization', req.headers.authorization);
  //           }
  //         });
  //         proxy.on('proxyRes', (proxyRes, req, _res) => {
  //           console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
  //         });
  //       },
  //     },
  //   },
  // },
})
