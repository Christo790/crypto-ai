export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
}

export interface ChartData {
  prices: [number, number][];
}

// [timestamp, open, high, low, close]
export type OHLCDataPointArray = [number, number, number, number, number];

export interface OHLCDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type OHLCData = OHLCDataPointArray[];