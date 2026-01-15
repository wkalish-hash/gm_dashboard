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
  ReferenceLine,
} from 'recharts';
import { formatCurrencyForDisplay, formatPercentForDisplay, formatNumberForDisplay } from '../utils/dataTransformers';

const LaborExpenses = ({ data }) => {
  if (!data) {
    return (
      <div className="dashboard-card">
        <h2>Labor Expenses</h2>
        <p>No data available</p>
      </div>
    );
  }

  const { totalLabor, totalHours, totalRevenue, percentOfRevenue, byDivision } = data;

  // Prepare data for horizontal bar chart
  // Only include revenue-producing divisions: Food & Beverage, Indoor Guest Services, and Ski School
  const allowedDivisions = ['Food & Beverage', 'Indoor Guest Services', 'Ski School'];
  const chartData = (byDivision || [])
    .filter(div => div.revenue > 0 && allowedDivisions.includes(div.division))
    .map(div => ({
      division: div.division,
      percentOfRevenue: div.percentOfRevenue || 0,
    }))
    .sort((a, b) => b.percentOfRevenue - a.percentOfRevenue); // Sort by percentage descending

  // Calculate color based on whether it's above or below 24%
  // const getBarColor = (percent) => {
  //   return percent > 24 ? '#ef4444' : '#3b82f6'; // Red if above 24%, blue if below
  // };

  return (
    <div className="dashboard-card">
      <h2>Labor Expenses</h2>
      
      {/* Total Metrics */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
              Total Labor
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
              {formatCurrencyForDisplay(totalLabor || 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
              Total Hours
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
              {formatNumberForDisplay(totalHours || 0, 0)}
            </div>
          </div>
          {totalRevenue > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Overall % of Revenue
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                {formatPercentForDisplay(percentOfRevenue || 0, 1)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Labor to Revenue Ratio by Division - Horizontal Bar Chart */}
      {chartData.length > 0 && (
        <div style={{ marginTop: '2rem', width: '100%' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#475569', textAlign: 'center' }}>
            Labor to Revenue Ratio by Division
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ResponsiveContainer width="95%" height={400}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number"
                domain={[0, 50]}
                stroke="#64748b"
                style={{ fontSize: '0.75rem' }}
                label={{ 
                  value: 'Labor as % of Revenue', 
                  position: 'insideBottom', 
                  offset: -5,
                  style: { textAnchor: 'middle', fill: '#64748b', fontSize: '0.875rem' }
                }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category"
                dataKey="division"
                stroke="#64748b"
                style={{ fontSize: '0.75rem' }}
                width={90}
              />
              <Tooltip 
                formatter={(value) => `${formatNumberForDisplay(value, 2)}%`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}
              />
              <ReferenceLine 
                x={24} 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: "24% Target", 
                  position: "top",
                  fill: '#10b981',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              />
              <Bar 
                dataKey="percentOfRevenue" 
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={'#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <p style={{ color: '#64748b', marginTop: '1rem' }}>No revenue data available for divisions</p>
      )}
    </div>
  );
};

export default LaborExpenses;
