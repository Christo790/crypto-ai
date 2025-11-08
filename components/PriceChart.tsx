import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { HistoricalDataPoint } from '../types';

interface PriceChartProps {
  data: HistoricalDataPoint[];
  coinName: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-surface p-3 border border-brand-border rounded-lg shadow-lg">
        <p className="text-sm text-brand-secondary">{formatDate(label)}</p>
        <p className="text-lg font-bold text-white">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data, coinName }) => {
  if (!data.length) {
    return (
      <div className="h-96 flex items-center justify-center bg-brand-surface rounded-lg">
        <p>No data available for {coinName}.</p>
      </div>
    );
  }
    
  const chartColor = data[data.length - 1].price >= data[0].price ? '#3fb950' : '#f85149';

  return (
    <div className="w-full h-96 bg-brand-surface p-4 rounded-xl border border-brand-border shadow-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatDate} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b949e', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b949e', fontSize: 12 }}
            dx={-10}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
