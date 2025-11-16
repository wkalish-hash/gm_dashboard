import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [rawData, setRawData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Use relative URL when in same environment (Shakudo), or full URL if specified in env
        // This avoids OAuth redirect issues when running in the same environment
        // If VITE_WEBHOOK_URL is not set, use relative path (works when deployed in same domain)
        const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || '/webhook/get_data'
        
        // Log for debugging (remove in production if needed)
        if (import.meta.env.DEV) {
          console.log('Fetching from webhook URL:', webhookUrl)
        }
        
        const response = await fetch(webhookUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin', // Include cookies for same-origin requests
          redirect: 'follow', // Follow redirects normally
        })
        
        // Check if response was redirected to OAuth (common indicators)
        if (response.redirected && response.url.includes('/auth/')) {
          throw new Error('Authentication required. Please ensure you are logged in to Shakudo.')
        }
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`)
        }
        
        const jsonData = await response.json()
        setRawData(jsonData)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Transform raw webhook data into the structure expected by the dashboard
  // Expected format from webhook: [{ Fiscal_Year: "FY26", Quantity: 586126, Amount: 224870904.53 }, ...]
  const transformData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
      return {
        seasonPassSales: {
          fy26: { Quantity: null, Amount: null },
          fy25: { Quantity: null, Amount: null }
        },
        ticketSales: {
          fy26: { Quantity: null, Amount: null },
          fy25: { Quantity: null, Amount: null }
        },
        lodging: {
          fy26: { Nights: null, Revenue: null },
          fy25: { Nights: null, Revenue: null }
        },
        resortNPS: {
          fy26: { Score: null },
          fy25: { Score: null }
        }
      }
    }

    // Find FY26 and FY25 data
    const fy26Data = rawData.find(item => item.Fiscal_Year === 'FY26')
    const fy25Data = rawData.find(item => item.Fiscal_Year === 'FY25')

    // Transform to dashboard structure
    // For now, we only have season pass data. When other data sources are added,
    // they can be included in the webhook response and mapped here
    return {
      seasonPassSales: {
        fy26: {
          Quantity: fy26Data?.Quantity || null,
          Amount: fy26Data?.Amount || null
        },
        fy25: {
          Quantity: fy25Data?.Quantity || null,
          Amount: fy25Data?.Amount || null
        }
      },
      ticketSales: {
        fy26: { Quantity: null, Amount: null },
        fy25: { Quantity: null, Amount: null }
      },
      lodging: {
        fy26: { Nights: null, Revenue: null },
        fy25: { Nights: null, Revenue: null }
      },
      resortNPS: {
        fy26: { Score: null },
        fy25: { Score: null }
      }
    }
  }

  const data = transformData(rawData)

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercent = (num) => {
    if (num === null || num === undefined) return 'N/A'
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
  }

  const calculatePercentChange = (current, previous) => {
    if (current === null || previous === null || previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  // Define sections with their metrics
  const sections = [
    {
      name: 'Season Pass Sales',
      metrics: [
        { key: 'Quantity', label: 'Quantity', format: formatNumber },
        { key: 'Amount', label: 'Amount', format: formatCurrency }
      ],
      data: data.seasonPassSales
    },
    {
      name: 'Ticket Sales',
      metrics: [
        { key: 'Quantity', label: 'Quantity', format: formatNumber },
        { key: 'Amount', label: 'Amount', format: formatCurrency }
      ],
      data: data.ticketSales
    },
    {
      name: 'Lodging',
      metrics: [
        { key: 'Nights', label: 'Nights', format: formatNumber },
        { key: 'Revenue', label: 'Revenue', format: formatCurrency }
      ],
      data: data.lodging
    },
    {
      name: 'Resort NPS',
      metrics: [
        { key: 'Score', label: 'Score', format: formatNumber }
      ],
      data: data.resortNPS
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            General Manager Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Resort Performance Overview
          </p>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 max-w-5xl w-full">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Key Metrics Comparison
          </h2>

          {loading && (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">Loading data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                Unable to fetch data from webhook. Please check your connection and try again.
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto flex justify-center">
            <table className="w-full max-w-4xl">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Section / Metric
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    FY26
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    FY25
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    % Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <React.Fragment key={section.name}>
                    {/* Section Header Row */}
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-200 dark:border-slate-600">
                      <td colSpan="4" className="py-3 px-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {section.name}
                        </h3>
                      </td>
                    </tr>
                    {/* Metric Rows */}
                    {section.metrics.map((metric) => {
                      const fy26Value = section.data.fy26[metric.key]
                      const fy25Value = section.data.fy25[metric.key]
                      const percentChange = calculatePercentChange(fy26Value, fy25Value)
                      const hasData = fy26Value !== null && fy25Value !== null
                      
                      return (
                        <tr 
                          key={`${section.name}-${metric.key}`}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <td className="py-3 px-4 pl-8 text-slate-700 dark:text-slate-300">
                            {metric.label}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-medium">
                            {metric.format(fy26Value)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-medium">
                            {metric.format(fy25Value)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {hasData && percentChange !== null ? (
                              <span className={`font-semibold ${
                                percentChange >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {formatPercent(percentChange)}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
