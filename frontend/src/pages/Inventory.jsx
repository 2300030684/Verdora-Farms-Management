import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PackageSearch, Plus, Edit2, Trash2, X } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'Solid', 
    price: '', 
    stockQuantity: '', 
    unit: 'Kg',
    imageUrl: ''
  });

  const getDisplayImage = (product) => {
    if (product.imageUrl) return product.imageUrl;
    const name = (product.name || '').toLowerCase();
    if (name.includes('milk')) return '/milk.png';
    if (name.includes('ghee')) return '/ghee.png';
    if (name.includes('paneer') || name.includes('cheese')) return '/paneer.png';
    return null;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10)
      };
      
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Error saving product. Please ensure the product name is unique and all fields are correct.');
    }
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      unit: product.unit,
      imageUrl: product.imageUrl || ''
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', category: 'Solid', price: '', stockQuantity: '', unit: 'Kg', imageUrl: '' });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Dairy Product Inventory</h2>
            <p className="text-sm text-gray-400 mt-1">Manage your processed dairy goods</p>
          </div>
        </div>
        <button 
          onClick={() => { closeModal(); setShowModal(true); }}
          className="bg-accent hover:bg-white text-dark hover:text-dark px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 font-bold shadow-[0_0_15px_rgba(212,163,115,0.4)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          <span className="font-bold tracking-widest uppercase text-sm">Loading inventory...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
          <PackageSearch className="w-16 h-16 mx-auto text-white/20 mb-4 drop-shadow-lg" />
          <p className="text-xl font-bold text-white tracking-wide">Inventory is empty</p>
          <p className="text-sm mt-2 text-gray-500">Add products like Ghee, Paneer, or Butter to start selling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg hover:border-white/20 hover:bg-white/10 transition-all duration-300 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-2 h-full shadow-[0_0_10px_currentColor] ${product.stockQuantity < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  {getDisplayImage(product) ? (
                    <img src={getDisplayImage(product)} alt={product.name} className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-md" />
                  ) : (
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                      <PackageSearch className="w-8 h-8 text-indigo-400" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-black text-white mt-2 tracking-tight">{product.name}</h3>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditClick(product)} className="text-blue-400 hover:text-white hover:bg-blue-500/50 bg-blue-500/20 border border-blue-500/30 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteClick(product.id)} className="text-red-400 hover:text-white hover:bg-red-500/50 bg-red-500/20 border border-red-500/30 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 bg-black/40 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Selling Price</p>
                  <p className="font-black text-xl text-white">₹{product.price} <span className="text-xs font-medium text-gray-400">/ {product.unit}</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Current Stock</p>
                  <p className={`font-black text-xl ${product.stockQuantity < 10 ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]'}`}>
                    {product.stockQuantity} <span className="text-xs font-medium text-gray-400">{product.unit}s</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141f17] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Product Name</label>
                <input 
                  type="text" required 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Premium Cow Ghee"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Category</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Liquid" className="bg-dark">Liquid</option>
                    <option value="Solid" className="bg-dark">Solid</option>
                    <option value="Powder" className="bg-dark">Powder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Unit Type</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="Kg" className="bg-dark">Kg</option>
                    <option value="Liters" className="bg-dark">Liters</option>
                    <option value="Packets" className="bg-dark">Packets</option>
                    <option value="Bottles" className="bg-dark">Bottles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Price (₹)</label>
                  <input 
                    type="number" required min="0" step="0.5"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Initial Stock</label>
                  <input 
                    type="number" required min="0"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Image URL (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="e.g. /milk.png"
                />
              </div>

              <button type="submit" className="w-full bg-accent hover:bg-white text-dark font-black tracking-wide py-4 rounded-xl transition-all duration-300 mt-8 shadow-[0_0_20px_rgba(212,163,115,0.4)]">
                {editingId ? 'UPDATE PRODUCT' : 'SAVE NEW PRODUCT'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
