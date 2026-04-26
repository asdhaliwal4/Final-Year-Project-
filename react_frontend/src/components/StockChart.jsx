import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Label } from 'recharts';

function StockChart({ symbol, apiKey, range, avgPrice }) { 
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Unique key so 1W and 1M data don't get mixed up
    const CACHE_KEY = `chart_${symbol}_${range}`;
    // Historical data doesn't change often, so we can cache for 1 hour
    const CACHE_DURATION = 60 * 60 * 1000; 

    // Check if we already have this chart saved in the browser
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isFresh = Date.now() - timestamp < CACHE_DURATION;

      if (isFresh) {
        setChartData(data);
        return; // Stop here and use the saved data
      }
    }

    // Otherwise, prepare the dates for a fresh API call
    const to = new Date().toISOString().split('T')[0];
    const fromDate = new Date();

    if (range === '1W') fromDate.setDate(fromDate.getDate() - 7);
    else if (range === '1M') fromDate.setMonth(fromDate.getMonth() - 1);
    else if (range === '1Y') fromDate.setFullYear(fromDate.getFullYear() - 1);

    const from = fromDate.toISOString().split('T')[0];

    fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          const formatted = data.results.map(item => ({
            date: new Date(item.t).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            price: item.c
          }));
          
          // Save the fresh chart to the browser vault
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: formatted,
            timestamp: Date.now()
          }));

          setChartData(formatted);
        }
      })
      .catch(err => console.error("My chart fetch failed:", err));
  }, [symbol, apiKey, range]);

  return (
    <div style={{ width: '100%', height: 350, minHeight: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 60, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />

          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
            interval={Math.floor(chartData.length / 6) || 0} 
            dy={15} 
          />

          <YAxis 
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            domain={['auto', 'auto']} 
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              color: '#fff' 
            }}
            itemStyle={{ color: '#3b82f6' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
          />

          {avgPrice > 0 && (
            <ReferenceLine 
              y={avgPrice} 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              strokeWidth={2}
            >
              <Label 
                value={`Avg: $${avgPrice}`} 
                position="right" 
                fill="#94a3b8" 
                fontSize={10}
                fontWeight={600}
              />
            </ReferenceLine>
          )}

          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            fill="url(#chartGradient)" 
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;