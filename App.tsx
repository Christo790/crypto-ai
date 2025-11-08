import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Coin, HistoricalDataPoint, OHLCDataPoint } from './types';
import { fetchCoins, fetchCoinChartData, fetchCoinOHLCData } from './services/cryptoService';
import CryptoCard from './components/CryptoCard';
import PriceChart from './components/PriceChart';
import CandleChart from './components/CandleChart';

type ChartType = 'line' | 'candle';

const App: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
  const [ohlcData, setOhlcData] = useState<OHLCDataPoint[]>([]);
  const [loadingCoins, setLoadingCoins] = useState<boolean>(true);
  const [loadingChart, setLoadingChart] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');

  const fetchCoinData = useCallback(async () => {
    try {
      setError(null);
      setLoadingCoins(true);
      const fetchedCoins = await fetchCoins();
      setCoins(fetchedCoins);
      if (fetchedCoins.length > 0) {
        setSelectedCoin(fetchedCoins[0]);
      }
    } catch (err) {
      setError('Failed to load cryptocurrency data. Please try again later.');
    } finally {
      setLoadingCoins(false);
    }
  }, []);

  useEffect(() => {
    fetchCoinData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedCoin) return;

    const fetchAllChartData = async () => {
      try {
        setLoadingChart(true);
        setError(null);
        
        const [lineData, candleData] = await Promise.all([
          fetchCoinChartData(selectedCoin.symbol),
          fetchCoinOHLCData(selectedCoin.symbol),
        ]);

        const formattedLineData: HistoricalDataPoint[] = lineData.prices.map(
          ([timestamp, price]) => ({ timestamp, price })
        );
        setChartData(formattedLineData);

        const formattedOhlcData: OHLCDataPoint[] = candleData.map(
            ([timestamp, open, high, low, close]) => ({ timestamp, open, high, low, close })
        );
        setOhlcData(formattedOhlcData);

      } catch (err) {
        setError(`Failed to load chart for ${selectedCoin.name}. It may not be available on Binance.`);
        setChartData([]);
        setOhlcData([]);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchAllChartData();
  }, [selectedCoin]);

  const handleSelectCoin = (coinId: string) => {
    const coin = coins.find((c) => c.id === coinId);
    if (coin) {
      setSelectedCoin(coin);
    }
  };
  
  const selectedCoinName = useMemo(() => selectedCoin?.name || 'Crypto', [selectedCoin]);

  const renderChart = () => {
    if (loadingChart) {
      return (
        <div className="h-96 flex items-center justify-center bg-brand-surface rounded-xl border border-brand-border">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div>
        </div>
      );
    }

    if(chartType === 'line') {
      return <PriceChart data={chartData} coinName={selectedCoinName} />;
    }
    
    return <CandleChart data={ohlcData} coinName={selectedCoinName} />;
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-white">CryptoPulse</h1>
          <p className="text-center text-brand-secondary mt-2">Real-time Cryptocurrency Price Tracker</p>
        </header>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center mb-6">{error}</div>}

        <section className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                    {selectedCoin && <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10"/>}
                    <h2 className="text-3xl font-semibold text-white">
                        {selectedCoin ? `${selectedCoinName} Price Chart (7d)` : 'Price Chart'}
                    </h2>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-lg p-1 flex items-center gap-1">
                  <button onClick={() => setChartType('line')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartType === 'line' ? 'bg-brand-primary text-white' : 'text-brand-secondary hover:bg-white/10'}`}>Line</button>
                  <button onClick={() => setChartType('candle')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartType === 'candle' ? 'bg-brand-primary text-white' : 'text-brand-secondary hover:bg-white/10'}`}>Candle</button>
                </div>
            </div>
          
            {renderChart()}
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-white mb-4">Top Cryptocurrencies</h2>
          {loadingCoins ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-brand-surface border border-brand-border rounded-lg p-4 animate-pulse h-36">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-brand-border rounded-full"></div>
                       <div>
                         <div className="h-5 w-24 bg-brand-border rounded"></div>
                         <div className="h-4 w-12 bg-brand-border rounded mt-1"></div>
                       </div>
                    </div>
                    <div className="w-20 h-10 bg-brand-border rounded"></div>
                  </div>
                   <div className="flex items-end justify-between mt-6">
                     <div className="h-6 w-28 bg-brand-border rounded"></div>
                     <div className="h-5 w-16 bg-brand-border rounded"></div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coins.map((coin) => (
                <CryptoCard
                  key={coin.id}
                  coin={coin}
                  onSelect={handleSelectCoin}
                  isSelected={selectedCoin?.id === coin.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="text-center text-brand-secondary mt-12 py-4 border-t border-brand-border">
        <p>Data provided by <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">CoinGecko</a> & <a href="https://www.binance.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Binance</a>.</p>
      </footer>
    </div>
  );
};

export default App;