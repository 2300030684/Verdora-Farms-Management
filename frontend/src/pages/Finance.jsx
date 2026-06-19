import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Topbar from '../components/Topbar';
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Finance = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Feed',
    amount: ''
  });

  const CATEGORIES = ['Feed', 'Veterinary', 'Equipment', 'Utilities', 'Misc'];
  const COLORS = ['#1c512c', '#d4a373', '#ef4444', '#3b82f6', '#8b5cf6', '#10b981'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      const summaryRes = await axios.get('http://localhost:8080/api/finance/summary', { headers });
      setSummary(summaryRes.data);

      const expensesRes = await axios.get('http://localhost:8080/api/expenses', { headers });
      setExpenses(expensesRes.data);
    } catch (err) {
      setError('Failed to load financial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ROLE_ADMIN') {
      fetchData();
    }
  }, [user]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      };
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post('http://localhost:8080/api/expenses', payload, { headers });
      setNewExpense({ description: '', category: 'Feed', amount: '' });
      fetchData(); // Refresh data
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="flex-1 bg-dark flex flex-col h-screen overflow-hidden">
        <Topbar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-xl text-red-500 font-bold">Access Denied. Administrators only.</p>
        </div>
      </div>
    );
  }

  // Format data for Recharts
  const pieData = summary?.expenseByCategory ? Object.entries(summary.expenseByCategory).map(([name, value]) => ({
    name, value
  })) : [];

  return (
    <div className="flex-1 bg-[#0f1712] flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      <Topbar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex justify-between items-end mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <div>
              <h2 className="text-3xl font-black text-white tracking-wide">Financial Ledger</h2>
              <p className="text-sm text-gray-400 mt-1">Track Verdora Farms income, expenses, and profitability.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
              <span className="font-bold tracking-widest uppercase text-sm">Loading financial data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl">{error}</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex items-center space-x-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                  <div className="p-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.2)] relative z-10"><TrendingUp className="w-8 h-8" /></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Total Income</p>
                    <p className="text-3xl font-black text-white mt-1">{formatCurrency(summary.totalIncome)}</p>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex items-center space-x-5 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500"></div>
                  <div className="p-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.2)] relative z-10"><TrendingDown className="w-8 h-8" /></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Total Expenses</p>
                    <p className="text-3xl font-black text-white mt-1">{formatCurrency(summary.totalExpense)}</p>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex items-center space-x-5 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-all duration-500 ${summary.netProfit >= 0 ? 'bg-accent/10 group-hover:bg-accent/20' : 'bg-red-500/10 group-hover:bg-red-500/20'}`}></div>
                  <div className={`p-4 rounded-2xl relative z-10 ${summary.netProfit >= 0 ? 'bg-accent/20 text-accent border border-accent/30 shadow-[0_0_15px_rgba(212,163,115,0.2)]' : 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Net Profit</p>
                    <p className={`text-3xl font-black mt-1 drop-shadow-md ${summary.netProfit >= 0 ? 'text-accent' : 'text-red-400'}`}>
                      {formatCurrency(summary.netProfit)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Expense Breakdown Chart */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-wide">
                    <PieChartIcon className="w-6 h-6 mr-3 text-accent" /> Expense Breakdown
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="rgba(255,255,255,0.1)"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)} 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ color: '#aaa', fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Add Expense Form */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-wide">
                    <Plus className="w-6 h-6 mr-3 text-accent" /> Log New Expense
                  </h3>
                  <form onSubmit={handleAddExpense} className="space-y-5 relative z-10">
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Description</label>
                      <input 
                        type="text" required
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                        value={newExpense.description}
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        placeholder="e.g. Monthly cattle feed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Category</label>
                        <select 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                          value={newExpense.category}
                          onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark">{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Amount (₹)</label>
                        <input 
                          type="number" required min="1" step="0.01"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] font-black text-lg"
                          value={newExpense.amount}
                          onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-accent hover:bg-white text-dark font-black tracking-wide py-4 rounded-xl transition-all duration-300 mt-6 shadow-[0_0_20px_rgba(212,163,115,0.4)]">
                      RECORD EXPENSE
                    </button>
                  </form>
                </div>
              </div>

              {/* Expense History Table */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden mt-6">
                <div className="p-8 border-b border-white/10">
                  <h3 className="text-xl font-black text-white tracking-wide">Recent Operational Expenses</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-gray-400 text-xs tracking-widest uppercase">
                      <tr>
                        <th className="px-8 py-5 font-bold">Date</th>
                        <th className="px-8 py-5 font-bold">Description</th>
                        <th className="px-8 py-5 font-bold">Category</th>
                        <th className="px-8 py-5 font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-bold tracking-wide">No operational expenses recorded yet.</td>
                        </tr>
                      ) : (
                        expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-white/5 transition-all duration-200">
                            <td className="px-8 py-5 text-sm text-gray-400 font-medium">
                              {new Date(exp.expenseDate).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-5 font-bold text-white tracking-wide">{exp.description}</td>
                            <td className="px-8 py-5">
                              <span className="px-4 py-1.5 bg-gray-500/20 border border-gray-500/30 text-gray-300 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">
                                {exp.category}
                              </span>
                            </td>
                            <td className="px-8 py-5 font-black text-red-400 text-lg drop-shadow-lg">
                              {formatCurrency(exp.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;
