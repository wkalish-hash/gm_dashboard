import axios from 'axios';
import { API_ENDPOINTS } from '../config/endpoints';

/**
 * API Service Layer
 * Handles all HTTP requests to n8n workflow endpoints
 * 
 * In development, uses local data files. In production, makes HTTP requests to n8n.
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
  timeout: 30000, // 30 second timeout
  // Send credentials (cookies) with requests when using proxy
  withCredentials: true,
});

/**
 * Transform ticket sales data from n8n webhook response
 * Matches the structure from localDataTransformers.js
 */
const transformTicketSalesFromAPI = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  
  const currentFY = data.find(item => item.fiscal_year === 'This Season');
  const previousFY = data.find(item => item.fiscal_year === 'Last Season');
  
  if (!currentFY || !previousFY) return null;
  
  const revenueAbsoluteChange = currentFY.total_paid_no_tax - previousFY.total_paid_no_tax;
  const revenuePercentChange = previousFY.total_paid_no_tax > 0 
    ? (revenueAbsoluteChange / previousFY.total_paid_no_tax) * 100 
    : 0;
  
  const quantityAbsoluteChange = currentFY.quantity_total - previousFY.quantity_total;
  const quantityPercentChange = previousFY.quantity_total > 0
    ? (quantityAbsoluteChange / previousFY.quantity_total) * 100
    : 0;
  
  return {
    currentSeason: {
      period: currentFY.fiscal_year,
      revenue: currentFY.total_paid_no_tax,
      quantity: currentFY.quantity_total,
    },
    lastSeason: {
      period: previousFY.fiscal_year,
      revenue: previousFY.total_paid_no_tax,
      quantity: previousFY.quantity_total,
    },
    revenueComparison: {
      percentChange: revenuePercentChange,
      absoluteChange: revenueAbsoluteChange,
    },
    quantityComparison: {
      percentChange: quantityPercentChange,
      absoluteChange: quantityAbsoluteChange,
    },
  };
};

/**
 * Transform season pass sales data from n8n webhook response
 * Matches the structure from localDataTransformers.js
 */
const transformSeasonPassSalesFromAPI = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  
  const currentFY = data.find(item => item.Fiscal_Year === 'FY26');
  const previousFY = data.find(item => item.Fiscal_Year === 'FY25');
  
  if (!currentFY || !previousFY) return null;
  
  const revenueAbsoluteChange = currentFY.Amount - previousFY.Amount;
  const revenuePercentChange = previousFY.Amount > 0 
    ? (revenueAbsoluteChange / previousFY.Amount) * 100 
    : 0;
  
  const quantityAbsoluteChange = currentFY.Quantity - previousFY.Quantity;
  const quantityPercentChange = previousFY.Quantity > 0
    ? (quantityAbsoluteChange / previousFY.Quantity) * 100
    : 0;
  
  return {
    currentSeason: {
      period: currentFY.Fiscal_Year,
      revenue: currentFY.Amount,
      quantity: currentFY.Quantity,
    },
    lastSeason: {
      period: previousFY.Fiscal_Year,
      revenue: previousFY.Amount,
      quantity: previousFY.Quantity,
    },
    revenueComparison: {
      percentChange: revenuePercentChange,
      absoluteChange: revenueAbsoluteChange,
    },
    quantityComparison: {
      percentChange: quantityPercentChange,
      absoluteChange: quantityAbsoluteChange,
    },
  };
};

/**
 * Transform labor data from n8n webhook response
 * Matches the structure from localDataTransformers.js
 */
const transformLaborFromAPI = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  
  // Sum up all labor expenses
  const totalLabor = data.reduce((sum, division) => sum + (division.totalLabor || 0), 0);
  const totalHours = data.reduce((sum, division) => sum + (division.totalHours || 0), 0);
  
  // Calculate total revenue from divisions
  const totalRevenue = data.reduce((sum, division) => sum + (division.revenue || 0), 0);
  
  // Add percentOfRevenue to each division
  const byDivision = data.map((division) => {
    const divRevenue = division.revenue || 0;
    const divLabor = division.totalLabor || 0;
    const divPercentOfRevenue = divRevenue > 0 ? (divLabor / divRevenue) * 100 : 0;
    
    return {
      ...division,
      percentOfRevenue: Math.round(divPercentOfRevenue * 100) / 100, // Round to 2 decimal places
    };
  });
  
  // Calculate overall percentOfRevenue using actual revenue
  const overallPercentOfRevenue = totalRevenue > 0 ? (totalLabor / totalRevenue) * 100 : 0;
  
  return {
    totalLabor: totalLabor,
    totalHours: totalHours,
    totalRevenue: totalRevenue,
    percentOfRevenue: Math.round(overallPercentOfRevenue * 100) / 100,
    byDivision: byDivision,
  };
};

/**
 * Fetch ticket sales data
 * @returns {Promise<Object>} Ticket sales data
 */
export const fetchTicketSales = async () => {
  if (USE_LOCAL_DATA) {
    console.log('Using local data for ticket sales');
    const { transformTicketSalesData } = await import('../utils/localDataTransformers');
    const data = transformTicketSalesData();
    return data?.ticketSales || null;
  }
  
  try {
    const url = API_ENDPOINTS.TICKET_SALES;
    if (!url) {
      throw new Error('Ticket sales endpoint URL is not configured');
    }
    console.log('Fetching ticket sales from:', url);
    const response = await apiClient.get(url);
    // Transform the response to match expected format
    return transformTicketSalesFromAPI(response.data);
  } catch (error) {
    const url = API_ENDPOINTS.TICKET_SALES;
    console.error('Error fetching ticket sales:', {
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
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
    const data = transformTicketSalesData();
    return data?.seasonPassSales || null;
  }
  
  try {
    const url = API_ENDPOINTS.SEASON_PASS_SALES;
    if (!url) {
      throw new Error('Season pass sales endpoint URL is not configured');
    }
    console.log('Fetching season pass sales from:', url);
    const response = await apiClient.get(url);
    // Transform the response to match expected format
    return transformSeasonPassSalesFromAPI(response.data);
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
    const data = transformTicketSalesData();
    if (!data) {
      throw new Error('Failed to load local sales data');
    }
    // Simulate async behavior
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 100);
    });
  }
  
  try {
    // Fetch both ticket sales and season pass sales in parallel
    const [ticketSales, seasonPassSales] = await Promise.all([
      fetchTicketSales(),
      fetchSeasonPassSales(),
    ]);
    
    // Combine both datasets (matching localDataTransformers.js structure)
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
    const data = transformLaborData();
    if (!data) {
      throw new Error('Failed to load local labor data');
    }
    // Simulate async behavior
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 100);
    });
  }
  
  try {
    const url = API_ENDPOINTS.LABOR;
    if (!url) {
      throw new Error('Labor endpoint URL is not configured');
    }
    console.log('Fetching labor expenses from:', url);
    const response = await apiClient.get(url);
    // Transform the response to match expected format
    return transformLaborFromAPI(response.data);
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
 * Transform NPS data from n8n webhook response
 * Matches the structure from localDataTransformers.js
 */
const transformNPSFromAPI = (data) => {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  
  // Handle both array and single object responses
  const npsData = Array.isArray(data) ? data[0] : data;
  
  return {
    yesterdayScore: npsData.yesterday_score || 0,
    lastYearYesterdayScore: npsData.last_year_yesterday_score || 0,
    yesterdayCompset: npsData.yesterday_compset || 0,
    lastYearYesterdayCompset: npsData.last_year_yesterday_compset || 0,
    scoreDifference: npsData.score_difference || 0,
    percentChange: npsData.percent_change || 0,
    yesterdayDate: npsData.yesterday_date,
    lastYearYesterdayDate: npsData.last_year_yesterday_date,
  };
};

/**
 * Fetch guest satisfaction (NPS) data
 * @returns {Promise<Object>} Guest satisfaction data
 */
export const fetchGuestSatisfaction = async () => {
  if (USE_LOCAL_DATA) {
    console.log('Using local data for guest satisfaction');
    const { transformNPSData } = await import('../utils/localDataTransformers');
    const data = transformNPSData();
    if (!data) {
      throw new Error('Failed to load local satisfaction data');
    }
    // Simulate async behavior
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 100);
    });
  }
  
  try {
    const url = API_ENDPOINTS.NPS;
    if (!url) {
      throw new Error('NPS endpoint URL is not configured');
    }
    console.log('Fetching guest satisfaction (NPS) from:', url);
    const response = await apiClient.get(url);
    // Transform the response to match expected format
    return transformNPSFromAPI(response.data);
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
