import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrencyForDisplay, formatPercentForDisplay, formatNumberForDisplay } from '../utils/dataTransformers';

// Helper component to render a comparison section
const ComparisonSection = ({ title, salesData }) => {
    if (!salesData) return null;

    const { currentSeason, lastSeason, revenueComparison, quantityComparison } = salesData;

    // Prepare revenue comparison data
    const revenueData = [
      {
        name: currentSeason?.period || 'Current',
        value: currentSeason?.revenue || 0,
        label: 'Current',
      },
      {
        name: lastSeason?.period || 'Previous',
        value: lastSeason?.revenue || 0,
        label: 'Previous',
      },
    ];

    // Prepare quantity comparison data
    const quantityData = [
      {
        name: currentSeason?.period || 'Current',
        value: currentSeason?.quantity || 0,
        label: 'Current',
      },
      {
        name: lastSeason?.period || 'Previous',
        value: lastSeason?.quantity || 0,
        label: 'Previous',
      },
    ];

    const revenueVarianceColor = revenueComparison?.percentChange >= 0 ? '#10b981' : '#ef4444';
    const quantityVarianceColor = quantityComparison?.percentChange >= 0 ? '#10b981' : '#ef4444';

    return (
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          marginBottom: '1.5rem', 
          marginTop: '1rem',
          color: '#0f172a',
          borderBottom: '2px solid #cbd5e1',
          paddingBottom: '0.75rem',
          paddingTop: '0.5rem',
          display: 'block',
          width: '100%',
          lineHeight: '1.5'
        }}>
          {title || 'Untitled Section'}
        </h3>

        {/* Revenue Comparison */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#475569' }}>
              Revenue Comparison
            </h4>
            <div style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: revenueVarianceColor + '15',
              borderRadius: '0.5rem',
              border: `1px solid ${revenueVarianceColor}40`
            }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', marginRight: '0.5rem' }}>
                YoY Variance:
              </span>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                color: revenueVarianceColor
              }}>
                {formatPercentForDisplay(revenueComparison?.percentChange || 0)}
              </span>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            gap: '1.5rem',
            marginBottom: '1rem',
            alignItems: 'stretch'
          }}>
            {/* Revenue Metrics */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  {currentSeason?.period || 'Current'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {formatCurrencyForDisplay(currentSeason?.revenue || 0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  {lastSeason?.period || 'Previous'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {formatCurrencyForDisplay(lastSeason?.revenue || 0)}
                </div>
              </div>
              <div style={{ 
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Change
                </div>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  color: revenueVarianceColor
                }}>
                  {formatCurrencyForDisplay(revenueComparison?.absoluteChange || 0)}
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'stretch',
              height: '100%'
            }}>
              <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                    return `$${value}`;
                  }}
                />
                <Tooltip 
                  formatter={(value) => formatCurrencyForDisplay(value)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#3b82f6' : '#94a3b8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quantity Comparison */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#475569' }}>
              Quantity Comparison
            </h4>
            <div style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: quantityVarianceColor + '15',
              borderRadius: '0.5rem',
              border: `1px solid ${quantityVarianceColor}40`
            }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', marginRight: '0.5rem' }}>
                YoY Variance:
              </span>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                color: quantityVarianceColor
              }}>
                {formatPercentForDisplay(quantityComparison?.percentChange || 0)}
              </span>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            gap: '1.5rem',
            alignItems: 'stretch'
          }}>
            {/* Quantity Metrics */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  {currentSeason?.period || 'Current'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {formatNumberForDisplay(currentSeason?.quantity || 0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  {lastSeason?.period || 'Previous'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {formatNumberForDisplay(lastSeason?.quantity || 0)}
                </div>
              </div>
              <div style={{ 
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Change
                </div>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  color: quantityVarianceColor
                }}>
                  {formatNumberForDisplay(quantityComparison?.absoluteChange || 0)}
                </div>
              </div>
            </div>

            {/* Quantity Chart */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'stretch',
              height: '100%'
            }}>
              <ResponsiveContainer width="100%" height={200}>
              <BarChart data={quantityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value.toString();
                  }}
                />
                <Tooltip 
                  formatter={(value) => formatNumberForDisplay(value)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {quantityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#3b82f6' : '#94a3b8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
};

const SalesComparison = ({ data }) => {
  if (!data) {
    return (
      <div className="dashboard-card">
        <h2>Sales Comparison</h2>
        <p>No data available</p>
      </div>
    );
  }

  const { ticketSales, seasonPassSales } = data;

  return (
    <div className="dashboard-card">
      <h2>Sales Comparison</h2>
      
      {/* Ticket Sales Section */}
      {ticketSales && (
        <ComparisonSection title="Ticket Sales" salesData={ticketSales} />
      )}

      {/* Season Pass Sales Section */}
      {seasonPassSales && (
        <ComparisonSection title="Season Pass Sales" salesData={seasonPassSales} />
      )}

      {!ticketSales && !seasonPassSales && (
        <p style={{ color: '#64748b', marginTop: '1rem' }}>No sales data available</p>
      )}
    </div>
  );
};

export default SalesComparison;
