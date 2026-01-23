import React from 'react';
import { formatCurrencyForDisplay, formatPercentForDisplay, formatNumberForDisplay } from '../utils/dataTransformers';

// Helper component for a metric display
const Metric = ({ label, value, formatter = formatCurrencyForDisplay, formatterArgs = [] }) => (
  <div style={{
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  }}>
    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
      {formatter(value || 0, ...formatterArgs)}
    </div>
  </div>
);

// Helper component for a division section
const DivisionSection = ({ title, children }) => (
  <div style={{
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  }}>
    <h3 style={{
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#0f172a',
      borderBottom: '2px solid #cbd5e1',
      paddingBottom: '0.75rem',
    }}>
      {title}
    </h3>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    }}>
      {children}
    </div>
  </div>
);

const LaborExpenses = ({ data, trailsLifts }) => {
  if (!data) {
    return (
      <div className="dashboard-card">
        <h2>Labor Expenses</h2>
        <p>No data available</p>
      </div>
    );
  }

  const { byDivision } = data;

  // Helper function to find a division by name
  const getDivision = (name) => {
    return (byDivision || []).find(div => 
      div.division?.toLowerCase() === name.toLowerCase()
    ) || null;
  };

  // Get division data
  const guestServices = getDivision('Guest Services');
  const foodBeverage = getDivision('Food & Beverage');
  const mountainOps = getDivision('Mountain Operations');
  const hospitality = getDivision('Hospitality');

  // Calculate labor per trail/lift for Mountain Operations
  const trailsOpen = trailsLifts?.trailsOpen || 0;
  const liftsOpen = trailsLifts?.liftsOpen || 0;
  const mountainOpsLabor = mountainOps?.totalLabor || 0;
  const laborPerTrail = trailsOpen > 0 ? mountainOpsLabor / trailsOpen : 0;
  const laborPerLift = liftsOpen > 0 ? mountainOpsLabor / liftsOpen : 0;

  return (
    <div className="dashboard-card">
      <h2>Labor Expenses</h2>
      
      {/* Guest Services Section */}
      <DivisionSection title="Guest Services">
        {guestServices?.revenue > 0 && (
          <Metric 
            label="Guest Services Revenue" 
            value={guestServices.revenue} 
          />
        )}
        <Metric 
          label="Guest Services Labor" 
          value={guestServices?.totalLabor || 0} 
        />
        {guestServices?.revenue > 0 && (
          <Metric 
            label="Guest Services Labor % of Revenue" 
            value={guestServices.percentOfRevenue || 0}
            formatter={formatPercentForDisplay}
            formatterArgs={[1]}
          />
        )}
      </DivisionSection>

      {/* Food & Beverage Section */}
      <DivisionSection title="Food & Beverage">
        {foodBeverage?.revenue > 0 && (
          <Metric 
            label="Food & Beverage Revenue" 
            value={foodBeverage.revenue} 
          />
        )}
        <Metric 
          label="Food & Beverage Labor" 
          value={foodBeverage?.totalLabor || 0} 
        />
        {foodBeverage?.revenue > 0 && (
          <Metric 
            label="Food & Beverage Labor % of Revenue" 
            value={foodBeverage.percentOfRevenue || 0}
            formatter={formatPercentForDisplay}
            formatterArgs={[1]}
          />
        )}
      </DivisionSection>

      {/* Mountain Operations Section */}
      <DivisionSection title="Mountain Operations">
        <Metric 
          label="Labor" 
          value={mountainOps?.totalLabor || 0} 
        />
        {trailsLifts && (
          <Metric 
            label="Trails Open" 
            value={trailsOpen}
            formatter={formatNumberForDisplay}
          />
        )}
        {trailsLifts && (
          <Metric 
            label="Lifts Open" 
            value={liftsOpen}
            formatter={formatNumberForDisplay}
          />
        )}
        {trailsLifts && trailsOpen > 0 && (
          <Metric 
            label="Labor per Open Trail" 
            value={laborPerTrail} 
          />
        )}
        {trailsLifts && liftsOpen > 0 && (
          <Metric 
            label="Labor per Open Lift" 
            value={laborPerLift} 
          />
        )}
      </DivisionSection>

      {/* Hospitality Section */}
      <DivisionSection title="Hospitality">
        <Metric 
          label="Labor" 
          value={hospitality?.totalLabor || 0} 
        />
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            ADR
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#94a3b8', fontStyle: 'italic' }}>
            Coming Soon
          </div>
        </div>
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Occupancy
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#94a3b8', fontStyle: 'italic' }}>
            Coming Soon
          </div>
        </div>
      </DivisionSection>
    </div>
  );
};

export default LaborExpenses;
