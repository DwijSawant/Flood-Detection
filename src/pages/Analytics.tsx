import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend
} from "recharts";
import { motion } from "motion/react";
import { Activity, TrendingUp, BarChart3, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface HistoricalData {
  date: string;
  rainfall: number;
  risk: number;
}

export default function Analytics() {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/historical")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.3em]">Loading_Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-mono p-4 lg:p-8">
      <header className="mb-12 border-b border-[#141414] pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-3">
            <Activity className="w-8 h-8" />
            ENVIRONMENTAL_ANALYTICS
          </h1>
          <p className="text-xs opacity-60 mt-2 italic uppercase tracking-widest">
            Historical rainfall patterns and predictive risk trends
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Last_Update</div>
          <div className="text-sm font-bold">{new Date().toLocaleTimeString()}</div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Avg Rainfall", value: (data.reduce((acc, d) => acc + d.rainfall, 0) / data.length).toFixed(1) + "mm" },
          { label: "Max Rainfall", value: Math.max(...data.map(d => d.rainfall)).toFixed(1) + "mm" },
          { label: "Avg Risk", value: (data.reduce((acc, d) => acc + d.risk, 0) / data.length * 100).toFixed(1) + "%" },
          { label: "Alert Level", value: Math.max(...data.map(d => d.risk)) > 0.7 ? "CRITICAL" : "STABLE" },
        ].map((stat, i) => (
          <div key={i} className="border border-[#141414] p-4 bg-white">
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">{stat.label}</div>
            <div className="text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rainfall Trend */}
        <div className="border border-[#141414] bg-white p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Rainfall_Trend_30D
            </h2>
            <span className="text-[10px] opacity-50 uppercase">Unit: mm</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 9 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.split('-')[2]}
                />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                  labelStyle={{ fontSize: '10px', marginBottom: '4px', opacity: 0.5 }}
                />
                <Area type="monotone" dataKey="rainfall" stroke="#141414" fillOpacity={1} fill="url(#colorRain)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Probability */}
        <div className="border border-[#141414] bg-white p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Risk_Probability_Index
            </h2>
            <span className="text-[10px] opacity-50 uppercase">Range: 0.0 - 1.0</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 9 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.split('-')[2]}
                />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                  labelStyle={{ fontSize: '10px', marginBottom: '4px', opacity: 0.5 }}
                />
                <Bar dataKey="risk" fill="#141414" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Log Table */}
      <div className="border border-[#141414] bg-white overflow-hidden">
        <div className="p-4 bg-black text-white flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4" /> Raw_Data_Log
          </h2>
          <span className="text-[10px] opacity-50 uppercase">Last 30 Entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#141414] bg-gray-50">
                <th className="p-4 text-[10px] font-bold uppercase opacity-50 italic">Date_Stamp</th>
                <th className="p-4 text-[10px] font-bold uppercase opacity-50 italic">Rainfall_MM</th>
                <th className="p-4 text-[10px] font-bold uppercase opacity-50 italic">Risk_Score</th>
                <th className="p-4 text-[10px] font-bold uppercase opacity-50 italic">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.slice().reverse().map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 text-xs font-mono">{row.date}</td>
                  <td className="p-4 text-xs font-mono">{row.rainfall.toFixed(1)}</td>
                  <td className="p-4 text-xs font-mono">{(row.risk * 100).toFixed(1)}%</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 border ${
                      row.risk > 0.6 ? "border-red-500 text-red-500" : 
                      row.risk > 0.3 ? "border-yellow-600 text-yellow-600" : "border-green-600 text-green-600"
                    }`}>
                      {row.risk > 0.6 ? "CRITICAL" : row.risk > 0.3 ? "ELEVATED" : "STABLE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
