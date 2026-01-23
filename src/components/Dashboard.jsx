import React, { useState, useEffect } from 'react';
import { fetchAllData } from '../services/api';
import SalesComparison from './SalesComparison';
import LaborExpenses from './LaborExpenses';
import GuestSatisfaction from './GuestSatisfaction';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState({
    sales: null,
    labor: null,
    satisfaction: null,
    trailsLifts: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const allData = await fetchAllData();
      setData(allData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up daily refresh (every 24 hours)
    const dailyInterval = setInterval(loadData, 24 * 60 * 60 * 1000);
    
    // Also set up a shorter interval for development/testing (every 5 minutes)
    // Remove or adjust this in production
    // const refreshInterval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => {
      clearInterval(dailyInterval);
      // clearInterval(refreshInterval);
    };
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  const formatLastRefresh = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">General Manager Dashboard</h1>
        <p className="dashboard-subtitle">Resort Performance Overview</p>
        {lastRefresh && (
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
            Last updated: {formatLastRefresh(lastRefresh)}
          </p>
        )}
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="error-container">
          <div className="error-title">Error Loading Data</div>
          <div className="error-message">{error}</div>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="dashboard-grid">
          <SalesComparison data={data.sales} />
          <LaborExpenses data={data.labor} trailsLifts={data.trailsLifts} />
          <GuestSatisfaction data={data.satisfaction} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
