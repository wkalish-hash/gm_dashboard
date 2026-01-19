import axios from 'axios';
import { API_ENDPOINTS } from '../config/endpoints';
import {
  transformTicketSales,
  transformSeasonPassSales,
  transformLabor,
  transformNPS,
} from '../utils/dataTransformers';

/**
 * API Service Layer
 * Handles all HTTP requests to n8n workflow endpoints
 * 
 * In development (when VITE_USE_LOCAL_DATA=true), uses local data files via localDataTransformers.
 * In production, makes HTTP requests to n8n and uses dataTransformers for transformation.
 */

// Use local data only if explicitly enabled via environment variable
// In production (built app), always use API calls to n8n webhooks
const USE_LOCAL_DATA = import.meta.env.VITE_USE_LOCAL_DATA === 'true';

// Configure axios defaults for API requests
// Note: If n8n webhooks require authentication, you can add VITE_N8N_API_KEY to .env
// The API key will be sent as Authorization Bearer token
const apiClient = axios.create({
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Add API key if provided (optional - for authenticated webhooks)
    // Uncomment and adjust the header name if n8n uses a different format:
    // 'X-N8N-API-KEY': import.meta.env.VITE_N8N_API_KEY,
    ...(import.meta.env.VITE_N8N_API_KEY && {
      'Authorization': `Bearer ${import.meta.env.VITE_N8N_API_KEY}`,
    }),
  },
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '90000', 10), // Default 90 seconds, configurable via env var
  // Send credentials (cookies) with requests when using proxy
  withCredentials: true,
});


/**
 * Fetch ticket sales data
 * @returns {Promise<Object>} Ticket sales data
 */
export const fetchTicketSales = async () => {
  if (USE_LOCAL_DATA) {
    console.log('Using local data for ticket sales');
    const { transformTicketSalesData } = await import('../utils/localDataTransformers');
    const data = await transformTicketSalesData();
    return data?.ticketSales || null;
  }
  
  try {
    const url = API_ENDPOINTS.TICKET_SALES;
    if (!url) {
      throw new Error('Ticket sales endpoint URL is not configured');
    }
    console.log('Fetching ticket sales from:', url);
    const response = await apiClient.get(url);
    
    // Handle different response structures (some APIs wrap data in objects)
    let responseData = response.data;
    if (responseData && !Array.isArray(responseData)) {
      // Check if data is nested (e.g., { data: [...] } or { results: [...] })
      if (responseData.data && Array.isArray(responseData.data)) {
        responseData = responseData.data;
      } else if (responseData.results && Array.isArray(responseData.results)) {
        responseData = responseData.results;
      }
    }
    
    // Log the raw response for debugging
    console.log('Ticket sales raw response:', {
      dataType: Array.isArray(responseData) ? 'array' : typeof responseData,
      dataLength: Array.isArray(responseData) ? responseData.length : 'N/A',
      sampleData: Array.isArray(responseData) && responseData.length > 0 
        ? responseData[0] 
        : responseData,
    });
    
    // Transform the response using dataTransformers (production)
    const transformed = transformTicketSales(responseData);
    
    if (!transformed) {
      console.warn('Ticket sales transformation returned null. Raw data:', response.data);
    }
    
    return transformed;
  } catch (error) {
    const url = API_ENDPOINTS.TICKET_SALES;
    console.error('Error fetching ticket sales:', {
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      responseData: error.response?.data,
    });
    throw new Error(`Failed to fetch ticket sales: ${error.message}`);
  }
};

/**
 * Fetch season pass sales data
 * @returns {Promise<Object>} Season pass sales data
 */
export const fetchSeasonPassSales = async () => {
  if (USE_LOCAL_DATA) {
    console.log('Using local data for season pass sales');
    const { transformTicketSalesData } = await import('../utils/localDataTransformers');
    const data = await transformTicketSalesData();
    return data?.seasonPassSales || null;
  }
  
  try {
    const url = API_ENDPOINTS.SEASON_PASS_SALES;
    if (!url) {
      throw new Error('Season pass sales endpoint URL is not configured');
    }
    console.log('Fetching season pass sales from:', url);
    const response = await apiClient.get(url);
    // Transform the response using dataTransformers (production)
    return transformSeasonPassSales(response.data);
  } catch (error) {
    const url = API_ENDPOINTS.SEASON_PASS_SALES;
    console.error('Error fetching season pass sales:', {
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
    });
    throw new Error(`Failed to fetch season pass sales: ${error.message}`);
  }
};

/**
 * Fetch sales comparison data (combines ticket sales and season pass sales)
 * @returns {Promise<Object>} Combined sales comparison data
 */
export const fetchSalesComparison = async () => {
  if (USE_LOCAL_DATA) {
    console.log('Using local data for sales comparison');
    const { transformTicketSalesData } = await import('../utils/localDataTransformers');
    const data = await transformTicketSalesData();
    if (!data) {
      throw new Error('Failed to load local sales data');
    }
    return data;
  }
  
  try {
    // Fetch both ticket sales and season pass sales in parallel
    // Use Promise.allSettled to handle partial failures gracefully
    const [ticketSalesResult, seasonPassSalesResult] = await Promise.allSettled([
      fetchTicketSales(),
      fetchSeasonPassSales(),
    ]);
    
    const ticketSales = ticketSalesResult.status === 'fulfilled' ? ticketSalesResult.value : null;
    const seasonPassSales = seasonPassSalesResult.status === 'fulfilled' ? seasonPassSalesResult.value : null;
    
    // Log any failures
    if (ticketSalesResult.status === 'rejected') {
      console.error('Failed to fetch ticket sales:', ticketSalesResult.reason);
    }
    if (seasonPassSalesResult.status === 'rejected') {
      console.error('Failed to fetch season pass sales:', seasonPassSalesResult.reason);
    }
    
    // Return whatever data we have (even if one failed)
    return {
      ticketSales: ticketSales,
      seasonPassSales: seasonPassSales,
    };
  } catch (error) {
    console.error('Error fetching sales comparison:', error);
    throw new Error(`Failed to fetch sales comparison: ${error.message}`);
  }
};

/**
 * Fetch labor expenses data
 * @returns {Promise<Object>} Labor expenses data
 */
export const fetchLaborExpenses = async () => {
  if (USE_LOCAL_DATA) {
    console.log('Using local data for labor expenses');
    const { transformLaborData } = await import('../utils/localDataTransformers');
    const data = await transformLaborData();
    if (!data) {
      throw new Error('Failed to load local labor data');
    }
    return data;
  }
  
  try {
    const url = API_ENDPOINTS.LABOR;
    if (!url) {
      throw new Error('Labor endpoint URL is not configured');
    }
    console.log('Fetching labor expenses from:', url);
    const response = await apiClient.get(url);
    // Transform the response using dataTransformers (production)
    return transformLabor(response.data);
  } catch (error) {
    const url = API_ENDPOINTS.LABOR;
    console.error('Error fetching labor expenses:', {
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
    });
    throw new Error(`Failed to fetch labor expenses: ${error.message}`);
  }
};

/**
 * Fetch guest satisfaction (NPS) data
 * @returns {Promise<Object>} Guest satisfaction data
 */
export const fetchGuestSatisfaction = async () => {
  if (USE_LOCAL_DATA) {
    console.log('Using local data for guest satisfaction');
    const { transformNPSData } = await import('../utils/localDataTransformers');
    const data = await transformNPSData();
    if (!data) {
      throw new Error('Failed to load local satisfaction data');
    }
    return data;
  }
  
  try {
    const url = API_ENDPOINTS.NPS;
    if (!url) {
      throw new Error('NPS endpoint URL is not configured');
    }
    console.log('Fetching guest satisfaction (NPS) from:', url);
    const response = await apiClient.get(url);
    // Transform the response using dataTransformers (production)
    return transformNPS(response.data);
  } catch (error) {
    const url = API_ENDPOINTS.NPS;
    console.error('Error fetching guest satisfaction:', {
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
    });
    throw new Error(`Failed to fetch guest satisfaction: ${error.message}`);
  }
};

/**
 * Fetch all dashboard data
 * @returns {Promise<Object>} All dashboard data
 */
export const fetchAllData = async () => {
  try {
    const [sales, labor, satisfaction] = await Promise.all([
      fetchSalesComparison(),
      fetchLaborExpenses(),
      fetchGuestSatisfaction(),
    ]);
    return {
      sales,
      labor,
      satisfaction,
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
};
