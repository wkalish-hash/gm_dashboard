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
  
  // Define consolidation rules
  const guestServicesDivisions = ['Ski School', 'Indoor Guest Services', 'Outdoor Guest Services'];
  const hospitalityDivisions = ['Lodging', 'Community Services'];
  const keepAsIs = ['Mountain Operations', 'Food & Beverage'];
  
  // Helper function to check if a division name matches (case-insensitive, flexible matching)
  const matchesDivision = (divisionName, targetNames) => {
    const normalized = divisionName?.trim() || '';
    return targetNames.some(target => 
      normalized.toLowerCase() === target.toLowerCase() ||
      normalized.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(normalized.toLowerCase())
    );
  };
  
  // Consolidate divisions
  const consolidated = {
    'Guest Services': {
      division: 'Guest Services',
      totalLabor: 0,
      totalHours: 0,
      revenue: 0,
    },
    'Hospitality': {
      division: 'Hospitality',
      totalLabor: 0,
      totalHours: 0,
      revenue: 0,
    },
    'Mountain Operations': {
      division: 'Mountain Operations',
      totalLabor: 0,
      totalHours: 0,
      revenue: 0,
    },
    'Food & Beverage': {
      division: 'Food & Beverage',
      totalLabor: 0,
      totalHours: 0,
      revenue: 0,
    },
  };
  
  // Process each division from the API
  data.forEach((division) => {
    const divName = division.division || division.divisionName || '';
    const labor = division.totalLabor || 0;
    const hours = division.totalHours || 0;
    const revenue = division.revenue || 0;
    
    if (matchesDivision(divName, guestServicesDivisions)) {
      consolidated['Guest Services'].totalLabor += labor;
      consolidated['Guest Services'].totalHours += hours;
      consolidated['Guest Services'].revenue += revenue;
    } else if (matchesDivision(divName, hospitalityDivisions)) {
      consolidated['Hospitality'].totalLabor += labor;
      consolidated['Hospitality'].totalHours += hours;
      consolidated['Hospitality'].revenue += revenue;
    } else if (matchesDivision(divName, ['Mountain Operations'])) {
      consolidated['Mountain Operations'].totalLabor += labor;
      consolidated['Mountain Operations'].totalHours += hours;
      consolidated['Mountain Operations'].revenue += revenue;
    } else if (matchesDivision(divName, ['Food & Beverage', 'Food and Beverage', 'F&B'])) {
      consolidated['Food & Beverage'].totalLabor += labor;
      consolidated['Food & Beverage'].totalHours += hours;
      consolidated['Food & Beverage'].revenue += revenue;
    }
    // All other divisions are ignored for now
  });
  
  // Convert to array and calculate percentOfRevenue for each consolidated division
  const byDivision = Object.values(consolidated).map((div) => {
    const divRevenue = div.revenue || 0;
    const divLabor = div.totalLabor || 0;
    const divPercentOfRevenue = divRevenue > 0 ? (divLabor / divRevenue) * 100 : 0;
    
    return {
      ...div,
      percentOfRevenue: Math.round(divPercentOfRevenue * 100) / 100, // Round to 2 decimal places
    };
  });
  
  // Calculate totals from consolidated divisions
  const totalLabor = byDivision.reduce((sum, div) => sum + (div.totalLabor || 0), 0);
  const totalHours = byDivision.reduce((sum, div) => sum + (div.totalHours || 0), 0);
  const totalRevenue = byDivision.reduce((sum, div) => sum + (div.revenue || 0), 0);
  
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
