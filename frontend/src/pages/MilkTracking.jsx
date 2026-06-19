import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Droplet, Plus, Edit2, Trash2, X } from 'lucide-react';

const MilkTracking = () => {
  const [records, setRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ quantityLiters: '', fatPercentage: '', snfPercentage: '', cattleId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, cattleRes] = await Promise.all([
        api.get('/milk-records'),
        api.get('/cattle')
      ]);
      setRecords(recordsRes.data);
      setCattleList(cattleRes.data);
      if (cattleRes.data.length > 0) {
        setFormData(prev => ({ ...prev, cattleId: cattleRes.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantityLiters: parseFloat(formData.quantityLiters),
        fatPercentage: parseFloat(formData.fatPercentage),
        snfPercentage: parseFloat(formData.snfPercentage)
      };

      if (editingId) {
        await api.put(`/milk-records/${editingId}`, payload);
      } else {
        await api.post(`/milk-records/${formData.cattleId}`, payload);
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving record:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Error logging milk. Please check values and try again.');
    }
  };

  const handleEditClick = (record) => {
    setFormData({
      quantityLiters: record.quantityLiters,
      fatPercentage: record.fatPercentage,
      snfPercentage: record.snfPercentage,
      cattleId: record.cattle?.id || (cattleList.length > 0 ? cattleList[0].id : '')
    });
    setEditingId(record.id);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this milk record?")) {
      try {
        await api.delete(`/milk-records/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ quantityLiters: '', fatPercentage: '', snfPercentage: '', cattleId: cattleList.length > 0 ? cattleList[0].id : '' });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Milk Tracking</h2>
            <p className="text-sm text-gray-400 mt-1">Log internal farm milk collections</p>
          </div>
        </div>
        <button 
          onClick={() => { closeModal(); setShowModal(true); }}
          className="bg-accent hover:bg-white text-dark hover:text-dark px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 font-bold shadow-[0_0_15px_rgba(212,163,115,0.4)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Log Milk
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          <span className="font-bold tracking-widest uppercase text-sm">Loading records...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
          <Droplet className="w-16 h-16 mx-auto text-white/20 mb-4 drop-shadow-lg" />
          <p className="text-xl font-bold text-white tracking-wide">No milk records found</p>
          <p className="text-sm mt-2 text-gray-500">Log a new session to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 border-b border-white/10 text-sm tracking-wider uppercase">
                <th className="p-5 font-bold">Date & Time</th>
                <th className="p-5 font-bold">Cattle Tag</th>
                <th className="p-5 font-bold">Quantity (Liters)</th>
                <th className="p-5 font-bold">Fat %</th>
                <th className="p-5 font-bold">SNF %</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="p-5 text-gray-400 font-medium">{new Date(record.collectionTime).toLocaleString()}</td>
                  <td className="p-5 font-bold text-white tracking-wide">{record.cattle?.tagNumber || 'Unknown'}</td>
                  <td className="p-5 text-accent font-black text-lg">{record.quantityLiters} L</td>
                  <td className="p-5 text-gray-300 font-medium">{record.fatPercentage}%</td>
                  <td className="p-5 text-gray-300 font-medium">{record.snfPercentage}%</td>
                  <td className="p-5 flex justify-end space-x-3 items-center">
                    <button onClick={() => handleEditClick(record)} className="text-blue-400 hover:text-white hover:bg-blue-500/50 bg-blue-500/20 border border-blue-500/30 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClick(record.id)} className="text-red-400 hover:text-white hover:bg-red-500/50 bg-red-500/20 border border-red-500/30 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Milk Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141f17] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">{editingId ? 'Edit Milk Record' : 'Log Milk Collection'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!editingId && (
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Select Cattle</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.cattleId} onChange={e => setFormData({...formData, cattleId: e.target.value})}
                    required
                  >
                    {cattleList.length === 0 ? <option value="" className="bg-dark">No cattle available</option> : null}
                    {cattleList.map(c => <option key={c.id} value={c.id} className="bg-dark">Tag: {c.tagNumber} ({c.breed})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Quantity (Liters)</label>
                <input 
                  type="number" required min="0" step="0.1"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] text-lg"
                  value={formData.quantityLiters} onChange={e => setFormData({...formData, quantityLiters: e.target.value})}
                  placeholder="e.g. 15.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Fat %</label>
                  <input 
                    type="number" required min="0" max="10" step="0.1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.fatPercentage} onChange={e => setFormData({...formData, fatPercentage: e.target.value})}
                    placeholder="e.g. 4.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">SNF %</label>
                  <input 
                    type="number" required min="0" max="15" step="0.1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.snfPercentage} onChange={e => setFormData({...formData, snfPercentage: e.target.value})}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>
              <button type="submit" disabled={!editingId && cattleList.length === 0} className="w-full bg-accent hover:bg-white text-dark disabled:bg-white/10 disabled:text-gray-500 font-black tracking-wide py-4 rounded-xl transition-all duration-300 mt-8 shadow-[0_0_20px_rgba(212,163,115,0.4)]">
                {editingId ? 'UPDATE RECORD' : 'SAVE RECORD'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilkTracking;
