import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '01/03', price: 340 },
  { date: '05/03', price: 355 },
  { date: '10/03', price: 348 },
  { date: '15/03', price: 362 },
  { date: '20/03', price: 359 },
  { date: '25/03', price: 375 },
  { date: '30/03', price: 362 },
];

const StockChart = () => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              color: '#fff' 
            }}
            itemStyle={{ color: '#3b82f6' }}
            cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
          />

          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fill="url(#chartGradient)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;