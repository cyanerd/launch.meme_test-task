import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Mock data generator
const generateMockData = (points: number = 12): { time: string; price: number }[] => {
  const data = [];
  const basePrice = 0.001;
  let currentPrice = basePrice;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 0.02; // Random change between -1% and +1%
    currentPrice = Math.max(0.0001, currentPrice * (1 + change));

    data.push({
      time: `${i}`,
      price: currentPrice
    });
  }

  return data;
};

const priceData = generateMockData();

export function CompactTradingStats() {
  const [currentPrice, setCurrentPrice] = useState(0.001);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    // Simulate live price updates
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.0001;
      setCurrentPrice(prev => Math.max(0.0001, prev + change));
      setPriceChange(change);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {/* Price Display */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-foreground">
            ${currentPrice.toFixed(4)}
          </div>
          <div className={`flex items-center space-x-1 text-sm font-semibold ${
            priceChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {priceChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{priceChange >= 0 ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}%</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">SOL/USD</div>
      </div>

      {/* Mini Chart */}
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--neon-cyan))"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <div className="font-semibold text-green-400">$1.2M</div>
          <div className="text-muted-foreground">24h Vol</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-primary">+8.5%</div>
          <div className="text-muted-foreground">24h Change</div>
        </div>
      </div>
    </div>
  );
}
