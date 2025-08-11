import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface StockData {
  success: boolean;
  symbol: string;
  companyName: string;
  formattedPrice: string;
  formattedChange: string;
  formattedChangePercent: string;
  isPositive: boolean;
  period: string;
  historicalData: Array<{
    timestamp: number;
    date: string;
    close: number;
  }>;
  intradayData: Array<{
    timestamp: number;
    date: string;
    close: number;
  }>;
  seriesByPeriod?: Record<string, Array<{ timestamp: number; date: string; close: number }>>;
  marketState: string;
  lastUpdated: string;
}

const StockWidget: React.FC<{ data: StockData }> = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(data.period || '1D');
  
  if (!data.success) {
    return null;
  }

  const periods = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'];
  const changeColor = data.isPositive ? 'text-green-400' : 'text-red-400';
  const lineColor = data.isPositive ? '#22c55e' : '#ef4444';
  
  // Prefer server-provided seriesByPeriod for live-like charts
  const chartSeries = (data.seriesByPeriod && data.seriesByPeriod[selectedPeriod]) || [];
  const fallback = selectedPeriod === '1D' && data.intradayData?.length > 0 ? data.intradayData : data.historicalData || [];
  const chartData = chartSeries.length > 0 ? chartSeries : fallback;

  // Format time labels based on period
  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    if (selectedPeriod === '1D') {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (['5D', '1M'].includes(selectedPeriod)) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
    }
  };

  // Get time range for bottom labels
  const getTimeLabels = () => {
    if (!chartData.length) return { start: '', end: '' };
    
    const startTime = chartData[0]?.timestamp;
    const endTime = chartData[chartData.length - 1]?.timestamp;
    
    if (selectedPeriod === '1D') {
      return {
        start: formatXAxisLabel(startTime),
        end: formatXAxisLabel(endTime)
      };
    }
    
    return {
      start: formatXAxisLabel(startTime),
      end: formatXAxisLabel(endTime)
    };
  };

  const { start, end } = getTimeLabels();

  return (
    <div className="rounded-lg border border-border p-4 sm:p-5 my-4 w-full max-w-2xl mx-auto bg-background text-foreground">
      {/* Header with company name and symbol */}
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">
          {data.companyName} ({data.symbol})
        </h2>
        
        {/* Price and change */}
        <div className="mb-4">
          <div className="text-3xl sm:text-4xl font-light mb-1.5 sm:mb-2">
            ${data.formattedPrice}
          </div>
          <div className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg font-medium ${changeColor}`}>
            <span className="flex items-center gap-1">
              {data.isPositive ? '▲' : '▼'}
              {data.formattedChange}({data.formattedChangePercent})
            </span>
            <span className="text-muted-foreground font-normal">Today</span>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 mb-6">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-all ${
                selectedPeriod === period
                  ? 'text-white border-b-2 border-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {chartData.length > 0 ? (
          <div className="h-56 sm:h-64 w-full mb-3 sm:mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="timestamp"
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: lineColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 sm:h-64 flex items-center justify-center text-muted-foreground">
            <p>No chart data available</p>
          </div>
        )}

        {/* Time labels */}
        {start && end && (
          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground px-2">
            <span>{start}</span>
            <span>{end}</span>
          </div>
        )}
      </div>

      {/* Market status */}
      <div className="mt-3 sm:mt-4 flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground">
        <span>Market: {data.marketState}</span>
        <span>Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

// Helper component for rendering stock data in markdown
export const StockDisplay: React.FC<{ stockData: string }> = ({ stockData }) => {
  try {
    const data: StockData = JSON.parse(stockData);
    return <StockWidget data={data} />;
  } catch (error) {
    return null;
  }
};

export default StockWidget;