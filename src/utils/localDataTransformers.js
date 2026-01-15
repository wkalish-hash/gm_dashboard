/**
 * Local Data Transformers
 * 
 * Transforms raw data from local data files into the format expected by components.
 * This is temporary for development - in production, n8n workflows will provide
 * data in the correct format.
 */

import npsData from '../../data/NPS.js';
import laborData from '../../data/labor.js';
import ticketSalesData from '../../data/ticketSales.js';
import seasonPassSalesData from '../../data/seasonPassSales.js';

/**
 * Transform NPS data to Guest Satisfaction format
 */
export const transformNPSData = () => {
  if (!npsData || npsData.length === 0) return null;
  
  const data = npsData[0];
  
  return {
    yesterdayScore: data.yesterday_score || 0,
    lastYearYesterdayScore: data.last_year_yesterday_score || 0,
    yesterdayCompset: data.yesterday_compset || 0,
    lastYearYesterdayCompset: data.last_year_yesterday_compset || 0,
    scoreDifference: data.score_difference || 0,
    percentChange: data.percent_change || 0,
    yesterdayDate: data.yesterday_date,
    lastYearYesterdayDate: data.last_year_yesterday_date,
  };
};

/**
 * Transform labor data to Labor Expenses format
 */
export const transformLaborData = () => {
  if (!laborData || laborData.length === 0) return null;
  
  // Sum up all labor expenses
  const totalLabor = laborData.reduce((sum, division) => sum + (division.totalLabor || 0), 0);
  const totalHours = laborData.reduce((sum, division) => sum + (division.totalHours || 0), 0);
  
  // Calculate total revenue from divisions
  const totalRevenue = laborData.reduce((sum, division) => sum + (division.revenue || 0), 0);
  
  // Add percentOfRevenue to each division
  const byDivision = laborData.map((division) => {
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
 * Transform ticket sales data to Sales Comparison format
 * Returns combined data with both ticket sales and season pass sales
 */
export const transformTicketSalesData = () => {
  // Transform ticket sales
  const ticketSales = (() => {
    if (!ticketSalesData || ticketSalesData.length === 0) return null;
    
    const currentFY = ticketSalesData.find(item => item.fiscal_year === 'This Season');
    const previousFY = ticketSalesData.find(item => item.fiscal_year === 'Last Season');
    
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
  })();
  
  // Transform season pass sales
  const seasonPassSales = transformSeasonPassSalesData();
  
  // Combine both datasets
  return {
    ticketSales: ticketSales,
    seasonPassSales: seasonPassSales,
  };
};

/**
 * Transform season pass sales data
 */
export const transformSeasonPassSalesData = () => {
  if (!seasonPassSalesData || seasonPassSalesData.length === 0) return null;
  
  const currentFY = seasonPassSalesData.find(item => item.Fiscal_Year === 'FY26');
  const previousFY = seasonPassSalesData.find(item => item.Fiscal_Year === 'FY25');
  
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
