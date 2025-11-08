import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { OHLCDataPoint } from '../types';

interface CandleChartProps {
  data: OHLCDataPoint[];
  coinName: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 8 : 2,
  }).format(value);
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-brand-surface p-3 border border-brand-border rounded-lg shadow-lg text-sm">
        <p className="font-bold text-white mb-2">{formatDate(label)}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-brand-secondary">Open:</span><span className="text-white text-right">{formatCurrency(data.open)}</span>
          <span className="text-brand-secondary">High:</span><span className="text-white text-right">{formatCurrency(data.high)}</span>
          <span className="text-brand-secondary">Low:</span><span className="text-white text-right">{formatCurrency(data.low)}</span>
          <span className="text-brand-secondary">Close:</span><span className="text-white text-right">{formatCurrency(data.close)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const Candlestick = (props: any) => {
    const { x, y, width, height, payload, yAxis } = props;
    if (!yAxis || !payload) return null;

    const { open, close, high, low } = payload;
    const isGrowing = close >= open;
    const color = isGrowing ? '#3fb950' : '#f85149';

    const wickX = x + width / 2;
    const highY = yAxis.scale(high);
    const lowY = yAxis.scale(low);
    
    const openY = yAxis.scale(open);
    const closeY = yAxis.scale(close);
    
    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(1, Math.abs(openY - closeY));

    return (
        <g stroke={color} fill={color} strokeWidth={1}>
            <line x1={wickX} y1={highY} x2={wickX} y2={lowY} />
            <rect x={x} y={bodyY} width={width} height={bodyHeight} />
        </g>
    );
};


const CandleChart: React.FC<CandleChartProps> = ({ data, coinName }) => {
  if (!data || !data.length) {
    return (
      <div className="h-96 flex items-center justify-center bg-brand-surface rounded-lg">
        <p>No data available for {coinName}.</p>
      </div>
    );
  }
    
  // Manually calculate the domain for the Y-axis to include high/low values
  const yMin = Math.min(...data.map(d => d.low));
  const yMax = Math.max(...data.map(d => d.high));
  const yPadding = (yMax - yMin) * 0.1; // 10% padding for better visuals

  return (
    <div className="w-full h-96 bg-brand-surface p-4 rounded-xl border border-brand-border shadow-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
            domain={[yMin - yPadding, yMax + yPadding]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.1)'}}/>
          <Bar dataKey="close" shape={<Candlestick />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandleChart;