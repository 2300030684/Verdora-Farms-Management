import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity as Cow, Plus, Edit2, Trash2, X } from 'lucide-react';

const Cattle = () => {
  const [cattleList, setCattleList] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ tagNumber: '', breed: '', ageMonths: '', weight: '', healthStatus: 'Healthy', farmerId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cattleRes, farmersRes] = await Promise.all([
        api.get('/cattle'),
        api.get('/farmers')
      ]);
      setCattleList(cattleRes.data);
      setFarmers(farmersRes.data);
      if (farmersRes.data.length > 0) {
        setFormData(prev => ({ ...prev, farmerId: farmersRes.data[0].id }));
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
        ageMonths: parseInt(formData.ageMonths, 10),
        weight: parseFloat(formData.weight)
      };

      if (editingId) {
        await api.put(`/cattle/${editingId}`, payload);
      } else {
        await api.post(`/cattle/${formData.farmerId}`, payload);
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving cattle:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Error saving cattle. Please ensure the tag number is unique and valid.');
    }
  };

  const handleEditClick = (cattle) => {
    setFormData({
      tagNumber: cattle.tagNumber,
      breed: cattle.breed,
      ageMonths: cattle.ageMonths,
      weight: cattle.weight,
      healthStatus: cattle.healthStatus,
      farmerId: cattle.farmer?.id || (farmers.length > 0 ? farmers[0].id : '')
    });
    setEditingId(cattle.id);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this cattle record? All associated milk records will also be deleted.")) {
      try {
        await api.delete(`/cattle/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting cattle:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ tagNumber: '', breed: '', ageMonths: '', weight: '', healthStatus: 'Healthy', farmerId: farmers.length > 0 ? farmers[0].id : '' });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Cow className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Cattle Management</h2>
            <p className="text-sm text-gray-400 mt-1">Manage herd registry and health status</p>
          </div>
        </div>
        <button 
          onClick={() => { closeModal(); setShowModal(true); }}
          className="bg-accent hover:bg-white text-dark hover:text-dark px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 font-bold shadow-[0_0_15px_rgba(212,163,115,0.4)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Cattle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          <span className="font-bold tracking-widest uppercase text-sm">Loading cattle...</span>
        </div>
      ) : cattleList.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
          <Cow className="w-16 h-16 mx-auto text-white/20 mb-4 drop-shadow-lg" />
          <p className="text-xl font-bold text-white tracking-wide">No cattle registered</p>
          <p className="text-sm mt-2 text-gray-500">Add a cow to start tracking health and milk yield.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 border-b border-white/10 text-sm tracking-wider uppercase">
                <th className="p-5 font-bold">Tag Number</th>
                <th className="p-5 font-bold">Breed</th>
                <th className="p-5 font-bold">Age (Months)</th>
                <th className="p-5 font-bold">Weight (kg)</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cattleList.map((cattle) => (
                <tr key={cattle.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="p-5 font-bold text-white text-lg tracking-wide">{cattle.tagNumber}</td>
                  <td className="p-5 text-gray-300 font-medium">{cattle.breed}</td>
                  <td className="p-5 text-gray-400 font-medium">{cattle.ageMonths}</td>
                  <td className="p-5 text-gray-400 font-medium">{cattle.weight}</td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg ${cattle.healthStatus === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {cattle.healthStatus}
                    </span>
                  </td>
                  <td className="p-5 flex justify-end space-x-3 items-center">
                    <button onClick={() => handleEditClick(cattle)} className="text-blue-400 hover:text-white hover:bg-blue-500/50 bg-blue-500/20 border border-blue-500/30 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClick(cattle.id)} className="text-red-400 hover:text-white hover:bg-red-500/50 bg-red-500/20 border border-red-500/30 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Cattle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141f17] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">{editingId ? 'Edit Cattle' : 'Add New Cattle'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Tag Number</label>
                <input 
                  type="text" required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.tagNumber} onChange={e => setFormData({...formData, tagNumber: e.target.value})}
                  placeholder="e.g. TG-1004"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Breed</label>
                <input 
                  type="text" required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})}
                  placeholder="e.g. Holstein Friesian"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Age (Months)</label>
                  <input 
                    type="number" required min="0"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.ageMonths} onChange={e => setFormData({...formData, ageMonths: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Weight (kg)</label>
                  <input 
                    type="number" required min="0" step="0.1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Health Status</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.healthStatus} onChange={e => setFormData({...formData, healthStatus: e.target.value})}
                  required
                >
                  <option value="Healthy" className="bg-dark">Healthy</option>
                  <option value="Sick" className="bg-dark">Sick</option>
                  <option value="Under Treatment" className="bg-dark">Under Treatment</option>
                </select>
              </div>
              {!editingId && (
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Owner (Farmer)</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.farmerId} onChange={e => setFormData({...formData, farmerId: e.target.value})}
                    required
                  >
                    {farmers.length === 0 ? <option value="" className="bg-dark">No farmers available</option> : null}
                    {farmers.map(f => <option key={f.id} value={f.id} className="bg-dark">{f.name}</option>)}
                  </select>
                </div>
              )}
              <button type="submit" disabled={!editingId && farmers.length === 0} className="w-full bg-accent hover:bg-white text-dark disabled:bg-white/10 disabled:text-gray-500 font-black tracking-wide py-4 rounded-xl transition-all duration-300 mt-8 shadow-[0_0_20px_rgba(212,163,115,0.4)]">
                {editingId ? 'UPDATE CATTLE' : 'SAVE CATTLE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cattle;
