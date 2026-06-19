import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplet, Activity, Users, Activity as Cow } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color }) => {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10 flex items-center justify-between hover:border-white/20 hover:bg-white/10 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="z-10 relative">
        <p className="text-gray-400 text-xs font-bold mb-1 tracking-widest uppercase">{title}</p>
        <h3 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">{value}</h3>
        <p className={`text-sm mt-2 font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
        </p>
      </div>
      <div className={`p-4 rounded-2xl border ${colorMap[color]} z-10 relative group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8" />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCattle: 0,
    activeFarmers: 0,
    totalYield: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cattleRes, farmersRes, milkRes, purchasesRes] = await Promise.all([
          api.get('/cattle'),
          api.get('/farmers'),
          api.get('/milk-records'),
          api.get('/purchases')
        ]);

        const cattleList = cattleRes.data;
        const farmersList = farmersRes.data;
        const internalMilk = milkRes.data;
        const purchasedMilk = purchasesRes.data;

        // Calculate total yield
        let totalMilk = 0;
        internalMilk.forEach(record => totalMilk += (record.quantityLiters || 0));
        purchasedMilk.forEach(record => totalMilk += (record.quantityLiters || 0));

        // Aggregate chart data by day of week (last 7 days logic approximated by grouping all dates into DOW)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const yieldByDay = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

        const addRecordToChart = (record, dateField) => {
          if (record[dateField]) {
            const d = new Date(record[dateField]);
            const dayName = days[d.getDay()];
            yieldByDay[dayName] += (record.quantityLiters || 0);
          }
        };

        internalMilk.forEach(r => addRecordToChart(r, 'collectionTime'));
        purchasedMilk.forEach(r => addRecordToChart(r, 'purchaseDate'));

        // Format chart data (starting from Monday to Sunday for display)
        const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chartData = orderedDays.map(day => ({
          name: day,
          yield: yieldByDay[day]
        }));

        setStats({
          totalCattle: cattleList.length,
          activeFarmers: farmersList.length,
          totalYield: totalMilk.toFixed(1),
          chartData: chartData
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm h-48 flex items-center p-8 bg-gray-900">
        <img 
          src="/dashboard_banner.png" 
          alt="Dashboard Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="relative z-10 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Welcome to Verdora Farms</h2>
          <p className="text-gray-200 text-lg max-w-2xl">
            Your intelligent farm overview. Monitor yields, track cattle health, and leverage AI predictions to optimize your dairy production today.
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading live analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Milk Yield" value={`${stats.totalYield} L`} icon={Droplet} trend={5.2} color="blue" />
            <StatCard title="Total Cattle" value={stats.totalCattle} icon={Cow} trend={1.5} color="emerald" />
            <StatCard title="Active Farmers" value={stats.activeFarmers} icon={Users} trend={0} color="purple" />
            <StatCard title="AI Health Scans" value="100%" icon={Activity} trend={2.1} color="orange" />
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white tracking-wide">Weekly Milk Production</h3>
              <button className="text-xs text-accent font-bold hover:text-white transition-colors uppercase tracking-widest border border-accent/30 hover:bg-accent/10 px-4 py-2 rounded-lg">View Report</button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141f17', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', color: '#fff' }}
                    itemStyle={{ color: '#d4a373', fontWeight: 'bold' }}
                    cursor={{ stroke: '#ffffff1a', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="yield" 
                    stroke="#d4a373" 
                    strokeWidth={5} 
                    dot={{ r: 5, fill: '#141f17', stroke: '#d4a373', strokeWidth: 2 }} 
                    activeDot={{ r: 8, fill: '#d4a373', stroke: '#fff', strokeWidth: 3 }} 
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
