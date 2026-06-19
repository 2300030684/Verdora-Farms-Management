import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserPlus, CheckCircle, XCircle, Calendar, IndianRupee, Edit2, Trash2, Clock } from 'lucide-react';

const Workers = () => {
  const [activeTab, setActiveTab] = useState('manage'); // manage, attendance, salary
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manage Tab State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', role: '', dailyWage: 500 });

  // Attendance Tab State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { workerId: 'PRESENT' }
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Salary Tab State
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [salaryReport, setSalaryReport] = useState([]);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance' && workers.length > 0) {
      fetchAttendanceForDate(attendanceDate);
    } else if (activeTab === 'salary') {
      fetchSalaryReport();
    }
  }, [activeTab, attendanceDate]);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/workers');
      setWorkers(res.data);
    } catch (error) {
      console.error('Error fetching workers', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      const res = await api.get(`/workers/attendance?date=${date}`);
      const map = {};
      // Initialize with default ABSENT or fetch existing
      workers.forEach(w => map[w.id] = 'ABSENT');
      res.data.forEach(att => {
        map[att.worker.id] = att.status;
      });
      setAttendanceMap(map);
      setAttendanceSaved(false);
    } catch (error) {
      console.error('Error fetching attendance', error);
    }
  };

  const fetchSalaryReport = async () => {
    try {
      const res = await api.get(`/workers/salary?year=${salaryYear}&month=${salaryMonth}`);
      setSalaryReport(res.data);
    } catch (error) {
      console.error('Error fetching salary report', error);
    }
  };

  // --- Manage Handlers ---
  const handleSubmitWorker = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/workers/${editingId}`, formData);
      } else {
        await api.post('/workers', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', role: '', dailyWage: 500 });
      fetchWorkers();
    } catch (error) {
      console.error('Error saving worker', error);
      alert('Failed to save worker. Please ensure the backend is running and you are authorized.');
    }
  };

  const handleEdit = (w) => {
    setEditingId(w.id);
    setFormData({ name: w.name, phone: w.phone, role: w.role, dailyWage: w.dailyWage });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        await api.delete(`/workers/${id}`);
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker', error);
      }
    }
  };

  // --- Attendance Handlers ---
  const saveAttendance = async () => {
    try {
      const payload = Object.keys(attendanceMap).map(workerId => ({
        workerId: parseInt(workerId),
        date: attendanceDate,
        status: attendanceMap[workerId]
      }));
      await api.post('/workers/attendance', payload);
      setAttendanceSaved(true);
      setTimeout(() => setAttendanceSaved(false), 3000);
    } catch (error) {
      console.error('Error saving attendance', error);
      alert('Failed to save attendance');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Workforce & Payroll</h2>
            <p className="text-sm text-gray-400 mt-1">Manage farm staff, mark attendance, and calculate salaries</p>
          </div>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Manage Workers
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'attendance' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Daily Attendance
          </button>
          <button 
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'salary' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Salary Reports
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* --- MANAGE TAB --- */}
          {activeTab === 'manage' && (
            <div className="animate-fade-in">
              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', role: '', dailyWage: 500 }); setShowModal(true); }}
                  className="bg-accent hover:bg-white text-dark hover:text-dark px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 font-bold shadow-[0_0_15px_rgba(212,163,115,0.4)]"
                >
                  <UserPlus className="w-5 h-5 mr-2" /> Add Worker
                </button>
              </div>

              {workers.length === 0 ? (
                <div className="text-center py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
                  <Users className="w-16 h-16 mx-auto text-white/20 mb-4" />
                  <p className="text-xl font-bold text-white">No workers added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workers.map(w => (
                    <div key={w.id} className="bg-black/30 border border-white/10 p-6 rounded-2xl relative group hover:border-purple-500/50 transition-colors">
                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(w)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(w.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-2xl font-black mb-4 border border-purple-500/30">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-xl font-black text-white">{w.name}</h3>
                      <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">{w.role || 'Worker'}</p>
                      
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between bg-white/5 p-2 rounded-lg">
                          <span>Phone:</span> <span className="font-bold">{w.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between bg-white/5 p-2 rounded-lg">
                          <span>Daily Wage:</span> <span className="font-bold text-emerald-400">₹{w.dailyWage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- ATTENDANCE TAB --- */}
          {activeTab === 'attendance' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-black/30 p-6 rounded-2xl border border-white/10 mb-8 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Select Date</label>
                    <input 
                      type="date" 
                      value={attendanceDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="bg-transparent text-white font-black text-xl outline-none border-none focus:ring-0 p-0 cursor-pointer"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={saveAttendance}
                  className="bg-emerald-500 hover:bg-emerald-400 text-dark font-black px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center"
                >
                  {attendanceSaved ? <><CheckCircle className="w-5 h-5 mr-2" /> Saved!</> : 'Save Attendance'}
                </button>
              </div>

              {workers.length === 0 ? (
                <div className="text-center py-20 text-gray-500">Add workers first before marking attendance.</div>
              ) : (
                <div className="space-y-4">
                  {workers.map(w => (
                    <div key={w.id} className="flex flex-col sm:flex-row items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-white border border-white/10">
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{w.name}</h4>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{w.role}</p>
                        </div>
                      </div>

                      <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                        <button 
                          onClick={() => setAttendanceMap({...attendanceMap, [w.id]: 'PRESENT'})}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${attendanceMap[w.id] === 'PRESENT' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Present
                        </button>
                        <button 
                          onClick={() => setAttendanceMap({...attendanceMap, [w.id]: 'HALF_DAY'})}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${attendanceMap[w.id] === 'HALF_DAY' ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          <Clock className="w-4 h-4 mr-2" /> Half Day
                        </button>
                        <button 
                          onClick={() => setAttendanceMap({...attendanceMap, [w.id]: 'ABSENT'})}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${attendanceMap[w.id] === 'ABSENT' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- SALARY TAB --- */}
          {activeTab === 'salary' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-black/30 p-6 rounded-2xl border border-white/10 mb-8 gap-4">
                <div className="flex space-x-4 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none bg-black/40 border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Month</label>
                    <select 
                      value={salaryMonth} 
                      onChange={(e) => { setSalaryMonth(e.target.value); fetchSalaryReport(); }}
                      className="bg-transparent text-white font-bold w-full outline-none"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m} className="bg-dark">{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 sm:flex-none bg-black/40 border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Year</label>
                    <select 
                      value={salaryYear} 
                      onChange={(e) => { setSalaryYear(e.target.value); fetchSalaryReport(); }}
                      className="bg-transparent text-white font-bold w-full outline-none"
                    >
                      {[2025, 2026, 2027].map(y => (
                        <option key={y} value={y} className="bg-dark">{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={fetchSalaryReport} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all">
                  Refresh Report
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-gray-300 border-b border-white/10 text-xs tracking-widest uppercase">
                      <th className="p-5 font-bold">Worker</th>
                      <th className="p-5 font-bold text-center">Days Present</th>
                      <th className="p-5 font-bold text-center">Half Days</th>
                      <th className="p-5 font-bold text-center">Effective Days</th>
                      <th className="p-5 font-bold">Daily Wage</th>
                      <th className="p-5 font-black text-right text-accent">Total Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryReport.map((report, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="p-5">
                          <div className="font-bold text-white text-lg">{report.worker.name}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">{report.worker.role}</div>
                        </td>
                        <td className="p-5 text-center text-emerald-400 font-black text-xl">{report.daysPresent}</td>
                        <td className="p-5 text-center text-yellow-400 font-bold text-lg">{report.daysHalf}</td>
                        <td className="p-5 text-center text-blue-400 font-black text-xl">{report.effectiveDays}</td>
                        <td className="p-5 text-gray-400 font-medium">₹{report.worker.dailyWage}</td>
                        <td className="p-5 text-right font-black text-2xl text-accent drop-shadow-[0_0_10px_rgba(212,163,115,0.3)]">
                          ₹{report.totalSalary}
                        </td>
                      </tr>
                    ))}
                    {salaryReport.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500">No data available for this month.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {salaryReport.length > 0 && (
                <div className="mt-8 bg-accent/10 border border-accent/20 rounded-2xl p-6 flex justify-between items-center shadow-[inset_0_2px_15px_rgba(212,163,115,0.1)]">
                  <span className="text-accent font-black tracking-widest uppercase">Total Payroll Estimate</span>
                  <span className="text-4xl font-black text-white drop-shadow-lg">
                    ₹{salaryReport.reduce((acc, curr) => acc + curr.totalSalary, 0)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141f17] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">{editingId ? 'Edit Worker' : 'Add New Worker'}</h3>
            
            <form onSubmit={handleSubmitWorker} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Worker Name</label>
                <input 
                  type="text" required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all shadow-inner"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all shadow-inner"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Role / Designation</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all shadow-inner"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  placeholder="e.g. Milker, Cleaner, General"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Daily Wage (₹)</label>
                <input 
                  type="number" required min="0"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all shadow-inner font-black text-xl text-emerald-400"
                  value={formData.dailyWage} onChange={e => setFormData({...formData, dailyWage: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black tracking-wide py-4 rounded-xl transition-all duration-300 mt-8 shadow-[0_0_20px_rgba(168,85,247,0.4)] text-lg">
                {editingId ? 'UPDATE WORKER' : 'ADD WORKER'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
