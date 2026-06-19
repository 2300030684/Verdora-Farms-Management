import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Edit2, Trash2, X } from 'lucide-react';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/farmers');
      setFarmers(response.data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/farmers/${editingId}`, formData);
      } else {
        await api.post('/farmers', formData);
      }
      closeModal();
      fetchFarmers();
    } catch (error) {
      console.error('Error saving farmer:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Error saving farmer. Please ensure phone number is unique and valid.');
    }
  };

  const handleEditClick = (farmer) => {
    setFormData({
      name: farmer.name,
      phone: farmer.phone,
      address: farmer.address
    });
    setEditingId(farmer.id);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this farmer? All of their cattle and milk records will also be deleted.")) {
      try {
        await api.delete(`/farmers/${id}`);
        fetchFarmers();
      } catch (error) {
        console.error('Error deleting farmer:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', address: '' });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Farmer Management</h2>
            <p className="text-sm text-gray-400 mt-1">Manage all registered dairy suppliers</p>
          </div>
        </div>
        <button 
          onClick={() => { closeModal(); setShowModal(true); }}
          className="bg-accent hover:bg-white text-dark hover:text-dark px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 font-bold shadow-[0_0_15px_rgba(212,163,115,0.4)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Farmer
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          <span className="font-bold tracking-widest uppercase text-sm">Loading farmers...</span>
        </div>
      ) : farmers.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
          <Users className="w-16 h-16 mx-auto text-white/20 mb-4 drop-shadow-lg" />
          <p className="text-xl font-bold text-white tracking-wide">No farmers registered</p>
          <p className="text-sm mt-2 text-gray-500">Add a farmer to start tracking milk procurement.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 border-b border-white/10 text-sm tracking-wider uppercase">
                <th className="p-5 font-bold">ID</th>
                <th className="p-5 font-bold">Name</th>
                <th className="p-5 font-bold">Phone</th>
                <th className="p-5 font-bold">Address</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="p-5 text-gray-400 text-sm font-medium">#{farmer.id}</td>
                  <td className="p-5 font-bold text-white flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/80 to-purple-500/40 border border-purple-500/50 flex items-center justify-center text-white font-black shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <span className="tracking-wide">{farmer.name}</span>
                  </td>
                  <td className="p-5 text-gray-300 font-medium">{farmer.phone}</td>
                  <td className="p-5 text-gray-400 text-sm">{farmer.address}</td>
                  <td className="p-5 flex justify-end space-x-3 items-center">
                    <button onClick={() => handleEditClick(farmer)} className="text-blue-400 hover:text-white hover:bg-blue-500/50 bg-blue-500/20 border border-blue-500/30 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClick(farmer.id)} className="text-red-400 hover:text-white hover:bg-red-500/50 bg-red-500/20 border border-red-500/30 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Farmer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141f17] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">{editingId ? 'Edit Farmer' : 'Add New Farmer'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Full Name</label>
                <input 
                  type="text" required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Farmer Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Phone Number</label>
                <input 
                  type="text" required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Address</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] min-h-[100px]"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Full Address"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-accent hover:bg-white text-dark font-black tracking-wide py-4 rounded-xl transition-all duration-300 mt-8 shadow-[0_0_20px_rgba(212,163,115,0.4)]">
                {editingId ? 'UPDATE FARMER' : 'SAVE NEW FARMER'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farmers;
