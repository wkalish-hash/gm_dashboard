/**
 * Data Transformers
 * 
 * Minimal presentation formatting only (e.g., date display strings for chart labels).
 * NOT for data structure transformation or business calculations.
 * All data transformation happens in n8n workflows.
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
