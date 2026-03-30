import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StockChart({ symbol, apiKey, range }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // I'm setting the 'to' date to today
    const to = new Date().toISOString().split('T')[0];
    const fromDate = new Date();

    // I'm calculating the 'from' date based on the timeframe I selected
    if (range === '1W') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (range === '1M') {
      fromDate.setMonth(fromDate.getMonth() - 1);
    } else if (range === '1Y') {
      fromDate.setFullYear(fromDate.getFullYear() - 1);
    }

    const from = fromDate.toISOString().split('T')[0];

    // I'm fetching the historical data from Polygon using my calculated date range
    fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          const formatted = data.results.map(item => ({
            // I'm formatting the date to DD/MM for my chart's X-axis
            date: new Date(item.t).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            price: item.c
          }));
          setChartData(formatted);
        }
      })
      .catch(err => console.error("My chart fetch failed:", err));
      
    // I've added 'range' here so the chart re-fetches whenever I click a timeframe button
  }, [symbol, apiKey, range]);

  return (
    <div style={{ width: '100%', height: 350, minHeight: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
            // I'm setting the interval so only a few dates show up to keep my UI clean
            interval={Math.floor(chartData.length / 6)} 
            dy={15} 
          />

          <YAxis hide domain={['auto', 'auto']} />

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