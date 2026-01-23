// Validate that all required environment variables are set
const validateEndpoint = (name, value) => {
  if (!value || value === 'undefined') {
    console.error(`Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}. Please check your .env file.`);
  }
  return value;
};

// Convert full n8n URLs to proxy paths to avoid CORS issues
// The proxy is handled by server.js in production and vite.config.js in development
const convertToProxyPath = (url) => {
  // Use proxy paths for n8n URLs in both development and production
  // This avoids CORS issues since requests go through the same origin
  if (url && url.includes('n8n-v2.mcp.hyperplane.dev')) {
    // Extract the path from the full URL and convert to proxy path
    const urlObj = new URL(url);
    return `/api/n8n${urlObj.pathname}${urlObj.search}`;
  }
  // Return the URL as-is if it's not an n8n URL
  return url;
};

const ticketSalesEndpoint = validateEndpoint('VITE_N8N_TICKET_SALES_ENDPOINT', import.meta.env.VITE_N8N_TICKET_SALES_ENDPOINT);
const seasonPassSalesEndpoint = validateEndpoint('VITE_N8N_SEASON_PASS_SALES_ENDPOINT', import.meta.env.VITE_N8N_SEASON_PASS_SALES_ENDPOINT);
const laborEndpoint = validateEndpoint('VITE_N8N_LABOR_ENDPOINT', import.meta.env.VITE_N8N_LABOR_ENDPOINT);
const npsEndpoint = validateEndpoint('VITE_N8N_NPS_ENDPOINT', import.meta.env.VITE_N8N_NPS_ENDPOINT);
const trailsLiftsEndpoint = validateEndpoint('VITE_N8N_TRAILS_LIFTS_ENDPOINT', import.meta.env.VITE_N8N_TRAILS_LIFTS_ENDPOINT);

export const API_ENDPOINTS = {
  TICKET_SALES: convertToProxyPath(ticketSalesEndpoint),
  SEASON_PASS_SALES: convertToProxyPath(seasonPassSalesEndpoint),
  LABOR: convertToProxyPath(laborEndpoint),
  NPS: convertToProxyPath(npsEndpoint),
  TRAILS_LIFTS: convertToProxyPath(trailsLiftsEndpoint),
};

// Log endpoints in development (without exposing full URLs)
if (import.meta.env.DEV) {
  console.log('API Endpoints configured:', {
    TICKET_SALES: API_ENDPOINTS.TICKET_SALES ? '✓ Set' : '✗ Missing',
    SEASON_PASS_SALES: API_ENDPOINTS.SEASON_PASS_SALES ? '✓ Set' : '✗ Missing',
    LABOR: API_ENDPOINTS.LABOR ? '✓ Set' : '✗ Missing',
    NPS: API_ENDPOINTS.NPS ? '✓ Set' : '✗ Missing',
    TRAILS_LIFTS: API_ENDPOINTS.TRAILS_LIFTS ? '✓ Set' : '✗ Missing',
  });
  console.log('Using proxy paths in development to avoid CORS issues');
}
