import React from 'react';
import '../styles/Dashboard.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Loading data...</p>
    </div>
  );
};

export default LoadingSpinner;
