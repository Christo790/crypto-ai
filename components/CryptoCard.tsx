import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Coin } from '../types';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

interface CryptoCardProps {
  coin: Coin;
  onSelect: (coinId: string) => void;
  isSelected: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
};

const CryptoCard: React.FC<CryptoCardProps> = ({ coin, onSelect, isSelected }) => {
  const isPositiveChange = coin.price_change_percentage_24h >= 0;
  const sparklineData = coin.sparkline_in_7d.price.map((price) => ({ price }));
  const chartColor = isPositiveChange ? '#3fb950' : '#f85149';

  return (
    <div
      onClick={() => onSelect(coin.id)}
      className={`bg-brand-surface border rounded-lg p-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 ${
        isSelected ? 'border-brand-primary shadow-2xl scale-105' : 'border-brand-border'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img src={coin.image} alt={coin.name} className="w-8 h-8" />
          <div>
            <p className="font-bold text-white text-lg">{coin.name}</p>
            <p className="text-sm text-brand-secondary uppercase">{coin.symbol}</p>
          </div>
        </div>
        <div className="w-20 h-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Line type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
      <div className="flex items-end justify-between mt-4">
        <p className="text-xl font-semibold text-white">{formatCurrency(coin.current_price)}</p>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            isPositiveChange ? 'text-brand-success' : 'text-brand-danger'
          }`}
        >
          {isPositiveChange ? <ArrowUpIcon /> : <ArrowDownIcon />}
          <span>{coin.price_change_percentage_24h.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;
