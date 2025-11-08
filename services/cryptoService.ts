import { Coin, ChartData, OHLCData } from '../types';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

// Fetch initial coin list from CoinGecko for its rich metadata
export const fetchCoins = async (): Promise<Coin[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Coin[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch coins:", error);
    throw error;
  }
};

// Fetch 7-day chart data from Binance for accurate pricing
export const fetchCoinChartData = async (coinSymbol: string): Promise<ChartData> => {
  // Handle Tether (USDT) as a special case, as USDT/USDT pair doesn't exist.
  // We'll return a flat line at $1.00.
  if (coinSymbol.toLowerCase() === 'usdt') {
    const now = Date.now();
    const prices: [number, number][] = [];
    // Create 42 data points for 7 days (simulating 4h interval)
    for (let i = 41; i >= 0; i--) {
        const timestamp = now - i * (4 * 60 * 60 * 1000);
        prices.push([timestamp, 1.00]);
    }
    return Promise.resolve({ prices });
  }

  try {
    const symbol = `${coinSymbol.toUpperCase()}USDT`;
    // Using 4h interval to get a decent number of data points for 7 days
    const response = await fetch(
      `${BINANCE_API_URL}/klines?symbol=${symbol}&interval=4h&limit=42`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: any[] = await response.json();
    // Binance kline format: [openTime, open, high, low, close, ...]
    // We need [timestamp, price] for the line chart, so we use openTime and close price.
    const prices: [number, number][] = data.map((kline) => [kline[0], parseFloat(kline[4])]);
    return { prices };
  } catch (error) {
    console.error(`Failed to fetch chart data for ${coinSymbol}:`, error);
    throw error;
  }
};

// Fetch 7-day OHLC data from Binance for the candlestick chart
export const fetchCoinOHLCData = async (coinSymbol: string): Promise<OHLCData> => {
    // Handle Tether (USDT) as a special case, returning flat $1.00 candles.
    if (coinSymbol.toLowerCase() === 'usdt') {
        const now = new Date();
        const data: OHLCData = [];
        // Create 7 daily candles
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0); // Start of the day
            data.push([date.getTime(), 1.00, 1.00, 1.00, 1.00]);
        }
        return Promise.resolve(data);
    }

    try {
      const symbol = `${coinSymbol.toUpperCase()}USDT`;
      // Using 1d interval for 7 daily candles
      const response = await fetch(
        `${BINANCE_API_URL}/klines?symbol=${symbol}&interval=1d&limit=7`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: any[] = await response.json();
      // Binance kline format: [openTime, open, high, low, close, ...]
      // We need [timestamp, open, high, low, close]
       return data.map(kline => [
        kline[0],
        parseFloat(kline[1]),
        parseFloat(kline[2]),
        parseFloat(kline[3]),
        parseFloat(kline[4])
      ]);
    } catch (error) {
      console.error(`Failed to fetch OHLC data for ${coinSymbol}:`, error);
      throw error;
    }
};
