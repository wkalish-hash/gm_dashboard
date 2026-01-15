// Validate that all required environment variables are set
const validateEndpoint = (name, value) => {
  if (!value || value === 'undefined') {
    console.error(`Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}. Please check your .env file.`);
  }
  return value;
};

// Convert full n8n URLs to proxy paths in development to avoid CORS issues
// In production, use the full URLs directly
const convertToProxyPath = (url) => {
  // Only use proxy in development mode (when running vite dev server)
  // In production (built app), use the full URL directly
  if (import.meta.env.DEV && url && url.includes('n8n-v2.mcp.hyperplane.dev')) {
    // Extract the path from the full URL and convert to proxy path
    const urlObj = new URL(url);
    return `/api/n8n${urlObj.pathname}${urlObj.search}`;
  }
  // In production, return the full URL as-is
  return url;
};

const ticketSalesEndpoint = validateEndpoint('VITE_N8N_TICKET_SALES_ENDPOINT', import.meta.env.VITE_N8N_TICKET_SALES_ENDPOINT);
const seasonPassSalesEndpoint = validateEndpoint('VITE_N8N_SEASON_PASS_SALES_ENDPOINT', import.meta.env.VITE_N8N_SEASON_PASS_SALES_ENDPOINT);
const laborEndpoint = validateEndpoint('VITE_N8N_LABOR_ENDPOINT', import.meta.env.VITE_N8N_LABOR_ENDPOINT);
const npsEndpoint = validateEndpoint('VITE_N8N_NPS_ENDPOINT', import.meta.env.VITE_N8N_NPS_ENDPOINT);

export const API_ENDPOINTS = {
  TICKET_SALES: convertToProxyPath(ticketSalesEndpoint),
  SEASON_PASS_SALES: convertToProxyPath(seasonPassSalesEndpoint),
  LABOR: convertToProxyPath(laborEndpoint),
  NPS: convertToProxyPath(npsEndpoint),
};

// Log endpoints in development (without exposing full URLs)
if (import.meta.env.DEV) {
  console.log('API Endpoints configured:', {
    TICKET_SALES: API_ENDPOINTS.TICKET_SALES ? '✓ Set' : '✗ Missing',
    SEASON_PASS_SALES: API_ENDPOINTS.SEASON_PASS_SALES ? '✓ Set' : '✗ Missing',
    LABOR: API_ENDPOINTS.LABOR ? '✓ Set' : '✗ Missing',
    NPS: API_ENDPOINTS.NPS ? '✓ Set' : '✗ Missing',
  });
  console.log('Using proxy paths in development to avoid CORS issues');
}
