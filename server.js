// Simple production server with health check endpoint and API proxy
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5173;
const HOST = '0.0.0.0';

// Verify dist directory exists before starting
const distPath = join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.error(`ERROR: dist directory not found at ${distPath}`);
  console.error('Please run "npm run build" first');
  process.exit(1);
}

const indexPath = join(distPath, 'index.html');
if (!existsSync(indexPath)) {
  console.error(`ERROR: index.html not found at ${indexPath}`);
  console.error('Build may have failed. Please check the build output.');
  process.exit(1);
}

console.log('✓ Dist directory verified');
console.log(`✓ Serving from: ${distPath}`);

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// Health check endpoint
const healthCheck = (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  };
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  });
  res.end(JSON.stringify(healthData));
  console.log('Health check requested - responding with 200 OK');
};

// Proxy API requests to n8n to avoid CORS issues
const proxyToN8n = (req, res) => {
  // Extract the path from /api/n8n/...
  const proxyPath = req.url.replace(/^\/api\/n8n/, '');
  const targetUrl = `https://n8n-v2.mcp.hyperplane.dev${proxyPath}`;
  
  console.log(`Proxying ${req.method} ${req.url} -> ${targetUrl}`);
  
  const url = new URL(targetUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: url.hostname, // Override host header
    },
  };
  
  // Remove headers that shouldn't be forwarded
  delete options.headers['host'];
  delete options.headers['connection'];
  
  // Explicitly forward cookies if present
  if (req.headers.cookie) {
    options.headers['cookie'] = req.headers.cookie;
  }
  
  // Use https for n8n
  const proxyReq = httpsRequest(options, (proxyRes) => {
    // Copy response headers (skip ones that shouldn't be forwarded)
    const headersToSkip = ['content-encoding', 'transfer-encoding', 'connection', 'content-length'];
    Object.keys(proxyRes.headers).forEach(key => {
      if (!headersToSkip.includes(key.toLowerCase())) {
        res.setHeader(key, proxyRes.headers[key]);
      }
    });
    
    // Set status code and pipe response
    res.writeHead(proxyRes.statusCode || 200);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy error', message: error.message }));
  });
  
  // Forward request body if present
  req.pipe(proxyReq);
};

// Serve static files
const serveFile = (req, res, filePath) => {
  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const stats = statSync(filePath);
    if (!stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const content = readFileSync(filePath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
    });
    res.end(content);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
};

// Main request handler
const server = createServer((req, res) => {
  // Log requests for debugging (can be removed in production if too verbose)
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health' || req.url === '/healthz') {
    healthCheck(req, res);
    return;
  }
  
  // Proxy API requests to n8n
  if (req.url.startsWith('/api/n8n')) {
    proxyToN8n(req, res);
    return;
  }

  // Parse URL
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // Remove query string
  filePath = filePath.split('?')[0];
  
  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Serve from dist directory
  const fullPath = join(__dirname, 'dist', filePath);
  
  // If file doesn't exist and it's not an asset (no extension), serve index.html for SPA routing
  if (!existsSync(fullPath) && !extname(filePath)) {
    const indexPath = join(__dirname, 'dist', 'index.html');
    if (existsSync(indexPath)) {
      serveFile(req, res, indexPath);
      return;
    }
  }
  
  serveFile(req, res, fullPath);
});

// Start server with error handling
try {
  server.listen(PORT, HOST, () => {
    console.log('==========================================');
    console.log(`✓ Server started successfully`);
    console.log(`✓ Listening on ${HOST}:${PORT}`);
    console.log(`✓ Health check: http://${HOST}:${PORT}/health`);
    console.log(`✓ Serving files from: ${distPath}`);
    console.log(`✓ Process PID: ${process.pid}`);
    console.log('==========================================');
    console.log('Server is ready to accept connections');
  });
} catch (error) {
  console.error('FATAL: Failed to start server:', error);
  console.error('Error details:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}

// Log that we're ready
console.log('Server process initialized, waiting for connections...');

// Error handling for server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use`);
    console.error('Please stop the process using this port or use a different port');
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
