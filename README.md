# GM Data Visualization Dashboard

A React-based dashboard that visualizes GM-level KPIs by fetching data from n8n workflows hosted on Shakudo. The dashboard displays Sales comparisons, Labor expenses, and Guest satisfaction scores with daily data updates.

## Features

- **Sales Comparison**: Compare current season vs last season sales with interactive charts
- **Labor Expenses**: Track labor expenses vs budget and as percentage of revenue
- **Guest Satisfaction**: View guest satisfaction scores by category with trend analysis
- **Auto-refresh**: Daily automatic data refresh with manual refresh option
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React** (JavaScript) - Main framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling (via @tailwindcss/vite)

## Project Structure

```
gm-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard container
│   │   ├── SalesComparison.jsx    # Sales season-over-season charts
│   │   ├── LaborExpenses.jsx      # Labor vs budget and % revenue
│   │   ├── GuestSatisfaction.jsx  # Guest satisfaction scores
│   │   └── LoadingSpinner.jsx     # Loading state component
│   ├── services/
│   │   └── api.js                 # API service for n8n endpoints
│   ├── utils/
│   │   └── dataTransformers.js    # Minimal presentation formatting
│   ├── config/
│   │   └── endpoints.js           # n8n workflow endpoint URLs
│   ├── styles/
│   │   └── Dashboard.css          # Dashboard styling
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the endpoint URLs with your actual n8n workflow URLs:
     ```
     VITE_N8N_SALES_ENDPOINT=https://your-shakudo-platform/n8n/sales-comparison
     VITE_N8N_LABOR_ENDPOINT=https://your-shakudo-platform/n8n/labor-expenses
     VITE_N8N_SATISFACTION_ENDPOINT=https://your-shakudo-platform/n8n/guest-satisfaction
     ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## n8n Workflow Data Format

The dashboard expects standardized JSON responses from n8n workflows. All data transformation should happen in n8n workflows, not in React.

### Sales Comparison Endpoint

Expected response format:
```json
{
  "currentSeason": {
    "period": "2024-Q1",
    "totalSales": 1250000,
    "byMonth": [
      { "month": "January", "sales": 400000 },
      { "month": "February", "sales": 450000 },
      { "month": "March", "sales": 400000 }
    ]
  },
  "lastSeason": {
    "period": "2023-Q1",
    "totalSales": 1100000,
    "byMonth": [...]
  },
  "comparison": {
    "percentChange": 13.6,
    "absoluteChange": 150000
  }
}
```

### Labor Expenses Endpoint

Expected response format:
```json
{
  "actual": 450000,
  "budget": 400000,
  "variance": 50000,
  "variancePercent": 12.5,
  "revenue": 1250000,
  "percentOfRevenue": 36.0,
  "budgetPercentOfRevenue": 32.0,
  "byPeriod": [
    { "period": "2024-01", "actual": 150000, "budget": 140000 }
  ]
}
```

### Guest Satisfaction Endpoint

Expected response format:
```json
{
  "overallScore": 4.5,
  "totalResponses": 1250,
  "byCategory": {
    "service": 4.6,
    "food": 4.4,
    "ambiance": 4.5,
    "value": 4.3
  },
  "trend": {
    "current": 4.5,
    "previous": 4.4,
    "change": 0.1
  },
  "byPeriod": [
    { "period": "2024-01", "score": 4.5 }
  ]
}
```

## Data Processing Strategy

**All data transformation happens in n8n workflows, not in React.**

Since stored procedures return data in formats we cannot control, all data processing (format conversion, field renaming, type conversion, date formatting, calculations) occurs in n8n workflows using Set nodes and Code nodes. React components receive ready-to-use, standardized JSON and focus solely on presentation.

The `dataTransformers.js` utility file is only used for minimal presentation formatting (e.g., date display strings for chart labels), not for data structure transformation or business calculations.

## Development

- The dashboard automatically refreshes data every 5 minutes during development
- In production, data refreshes daily (every 24 hours)
- Manual refresh is available via the "Refresh Data" button

## License

Private project - All rights reserved
