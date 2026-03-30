import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function StockChart({ symbol, apiKey, range }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
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
          setChartData(formatted);
        }
      })
      .catch(err => console.error("My chart fetch failed:", err));
  }, [symbol, apiKey, range]);

  return (
    <div style={{ width: '100%', height: 350, minHeight: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          {/* I've added a light grid to help me track the prices better */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />

          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
            interval={Math.floor(chartData.length / 6)} 
            dy={15} 
          />

          {/* I've un-hidden the YAxis and moved it to the right like a real trading app */}
          <YAxis 
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            // 'auto' makes sure the graph zooms in on the price action rather than starting at $0
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