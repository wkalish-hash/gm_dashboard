import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumberForDisplay } from '../utils/dataTransformers';

const GuestSatisfaction = ({ data }) => {
  if (!data) {
    return (
      <div className="dashboard-card">
        <h2>Guest Satisfaction</h2>
        <p>No data available</p>
      </div>
    );
  }

  const { 
    yesterdayScore, 
    lastYearYesterdayScore, 
    yesterdayCompset,
    lastYearYesterdayCompset,
  } = data;

  // Prepare data for line chart
  const chartData = [
    {
      period: 'Last Year',
      score: lastYearYesterdayScore,
      compset: lastYearYesterdayCompset,
    },
    {
      period: 'Yesterday',
      score: yesterdayScore,
      compset: yesterdayCompset,
    },
  ];

  return (
    <div className="dashboard-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '0.75rem', marginTop: 0 }}>Guest Satisfaction</h2>
      
      {/* Line Chart */}
      <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ left: 20, right: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="period" 
              stroke="#64748b"
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '0.75rem' }}
              domain={[0, 100]}
              label={{ 
                value: 'NPS Score', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#64748b', fontSize: '0.875rem' }
              }}
            />
            <Tooltip 
              formatter={(value) => formatNumberForDisplay(value, 2)}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="NPS Score"
              dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="compset" 
              stroke="#94a3b8" 
              strokeWidth={3}
              name="Competitive Set"
              dot={{ r: 6, fill: '#94a3b8', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default GuestSatisfaction;
