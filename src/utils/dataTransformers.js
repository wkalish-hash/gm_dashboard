/**
 * Data Transformers
 * 
 * Transforms data from n8n workflow endpoints into the format expected by components.
 * Also includes presentation formatting functions (e.g., date display strings for chart labels).
 * 
 * Used in production when fetching data from n8n workflows.
 * For development with local data files, see localDataTransformers.js
 */

/**
 * Format date for display in chart labels
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Format number for display (adds thousand separators)
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumberForDisplay = (num, decimals = 0) => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrencyForDisplay = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage for display
 * @param {number} value - Percentage value (e.g., 13.6 for 13.6%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentForDisplay = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Transform ticket sales data from n8n webhook response
 * @param {Array} data - Raw ticket sales data from n8n
 * @returns {Object|null} Transformed ticket sales data
 */
export const transformTicketSales = (data) => {
  if (!data) {
    console.warn('transformTicketSales: No data provided');
    return null;
  }
  
  if (!Array.isArray(data)) {
    console.warn('transformTicketSales: Data is not an array:', typeof data, data);
    return null;
  }
  
  if (data.length === 0) {
    console.warn('transformTicketSales: Data array is empty');
    return null;
  }
  
  const currentFY = data.find(item => item.fiscal_year === 'This Season');
  const previousFY = data.find(item => item.fiscal_year === 'Last Season');
  
  if (!currentFY || !previousFY) {
    console.warn('transformTicketSales: Missing required fiscal year data', {
      hasCurrentFY: !!currentFY,
      hasPreviousFY: !!previousFY,
      availableFiscalYears: data.map(item => item.fiscal_year),
      sampleItem: data[0],
    });
    return null;
  }
  
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
 * @param {Array} data - Raw season pass sales data from n8n
 * @returns {Object|null} Transformed season pass sales data
 */
export const transformSeasonPassSales = (data) => {
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
 * @param {Array} data - Raw labor data from n8n
 * @returns {Object|null} Transformed labor data
 */
export const transformLabor = (data) => {
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
 * Transform NPS data from n8n webhook response
 * @param {Array|Object} data - Raw NPS data from n8n
 * @returns {Object|null} Transformed NPS data
 */
export const transformNPS = (data) => {
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
