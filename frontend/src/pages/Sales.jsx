import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Plus, Globe, Store, Trash2, X, MessageCircle } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ 
    productId: '', 
    quantity: 1, 
    saleType: 'OFFLINE', 
    customerName: '', 
    customerPhone: '',
    totalPrice: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products')
      ]);
      // Sort sales newest first
      const sortedSales = salesRes.data.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
      setSales(sortedSales);
      setProducts(productsRes.data);
      
      if (productsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, productId: productsRes.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto calculate total price when product or quantity changes
  useEffect(() => {
    if (formData.productId && products.length > 0) {
      const product = products.find(p => p.id === parseInt(formData.productId));
      if (product) {
        setFormData(prev => ({
          ...prev,
          totalPrice: (product.price * prev.quantity).toFixed(2)
        }));
      }
    }
  }, [formData.productId, formData.quantity, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check stock locally before submitting
    const product = products.find(p => p.id === parseInt(formData.productId));
    if (product && product.stockQuantity < parseInt(formData.quantity)) {
      setError(`Insufficient stock! Only ${product.stockQuantity} left.`);
      return;
    }

    try {
      const payload = {
        product: { id: parseInt(formData.productId) },
        quantity: parseInt(formData.quantity),
        saleType: formData.saleType,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        totalPrice: parseFloat(formData.totalPrice)
      };

      await api.post('/sales', payload);
      closeModal();
      fetchData(); // Refreshes both sales and updated inventory stock
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.response?.data || 'Error processing sale');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Delete sale? This will RESTORE the stock to inventory.')) {
      try {
        await api.delete(`/sales/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  const sendWhatsAppReceipt = (sale) => {
    const customerPhone = sale.customerPhone;
    
    if (!customerPhone) {
      alert("No phone number recorded for this customer. Cannot send WhatsApp receipt.");
      return;
    }

    const dateStr = new Date(sale.saleDate).toLocaleDateString();
    const customerName = sale.customerName || 'Customer';
    const saleType = sale.saleType === 'ONLINE' ? '🌐 Online Order' : '🏪 Walk-in Purchase';

    const message = `*VERDORA FARMS - Sales Receipt* 🧾
--------------------------
*Date:* ${dateStr}
*Type:* ${saleType}
*Customer:* ${customerName}
--------------------------
*Item:* ${sale.product.name}
*Qty:* ${sale.quantity} ${sale.product.unit}
*Price/Unit:* ₹${sale.product.price}
--------------------------
*TOTAL PAID:* ₹${sale.totalPrice}

Thank you for choosing Verdora Farms! 🐄✨`;

    // Remove any non-numeric characters from the phone number except the leading +
    const cleanPhone = customerPhone.replace(/(?!^\+)[^\d]/g, '');
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
    setFormData({ 
      productId: products.length > 0 ? products[0].id : '', 
      quantity: 1, 
      saleType: 'OFFLINE', 
      customerName: '', 
      customerPhone: '',
      totalPrice: 0
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Point of Sale & Orders</h2>
            <p className="text-sm text-gray-400 mt-1">Manage online orders and offline walk-in sales</p>
          </div>
        </div>
        <button 
          onClick={() => { closeModal(); setShowModal(true); }}
          className="bg-accent hover:bg-white text-dark hover:text-dark px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 font-bold shadow-[0_0_15px_rgba(212,163,115,0.4)]"
        >
          <Plus className="w-5 h-5 mr-2" /> New Sale
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          <span className="font-bold tracking-widest uppercase text-sm">Loading sales history...</span>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
          <ShoppingCart className="w-16 h-16 mx-auto text-white/20 mb-4 drop-shadow-lg" />
          <p className="text-xl font-bold text-white tracking-wide">No sales recorded yet</p>
          <p className="text-sm mt-2 text-gray-500">Click New Sale to log your first customer purchase.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 border-b border-white/10 text-sm tracking-wider uppercase">
                <th className="p-5 font-bold">Date & Time</th>
                <th className="p-5 font-bold">Type</th>
                <th className="p-5 font-bold">Customer</th>
                <th className="p-5 font-bold">Product</th>
                <th className="p-5 font-bold">Qty</th>
                <th className="p-5 font-bold">Total Revenue</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="p-5 text-gray-400 font-medium text-sm">{new Date(sale.saleDate).toLocaleString()}</td>
                  <td className="p-5">
                    {sale.saleType === 'ONLINE' ? (
                      <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-full w-fit shadow-md">
                        <Globe className="w-3 h-3 mr-1.5" /> ONLINE
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-teal-400 bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-full w-fit shadow-md">
                        <Store className="w-3 h-3 mr-1.5" /> OFFLINE
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-white tracking-wide">{sale.customerName || 'Walk-in Customer'}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{sale.customerPhone || 'N/A'}</p>
                  </td>
                  <td className="p-5 font-bold text-gray-300">{sale.product.name}</td>
                  <td className="p-5 text-gray-300 font-medium">{sale.quantity} <span className="text-xs text-gray-500 font-bold uppercase ml-1">{sale.product.unit}</span></td>
                  <td className="p-5 font-black text-emerald-400 text-lg drop-shadow-lg">₹{sale.totalPrice}</td>
                  <td className="p-5 flex justify-end space-x-2">
                    <button onClick={() => sendWhatsAppReceipt(sale)} className="text-green-400 hover:text-white hover:bg-green-500/50 bg-green-500/20 border border-green-500/30 p-2 rounded-lg transition-colors" title="Send WhatsApp Receipt">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(sale.id)} className="text-red-400 hover:text-white hover:bg-red-500/50 bg-red-500/20 border border-red-500/30 p-2 rounded-lg transition-colors" title="Delete & Restore Stock">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POS Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141f17] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide flex items-center">
              <ShoppingCart className="w-6 h-6 mr-3 text-accent" /> New Sale POS
            </h3>
            
            {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm font-bold rounded-xl border border-red-500/20">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, saleType: 'OFFLINE'})}
                  className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center transition-all duration-300 ${formData.saleType === 'OFFLINE' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}
                >
                  <Store className="w-4 h-4 mr-2" /> Offline Walk-in
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, saleType: 'ONLINE'})}
                  className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center transition-all duration-300 ${formData.saleType === 'ONLINE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}
                >
                  <Globe className="w-4 h-4 mr-2" /> Online Order
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Select Product</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}
                  required
                >
                  {products.length === 0 ? <option value="" className="bg-dark">No products in inventory</option> : null}
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stockQuantity === 0} className="bg-dark">
                      {p.name} - ₹{p.price}/{p.unit} ({p.stockQuantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Quantity</label>
                <input 
                  type="number" required min="1"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] text-xl font-black"
                  value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || ''})}
                />
              </div>

              <div className="grid grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Customer Name <span className="text-gray-600 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})}
                    placeholder="E.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Customer Phone <span className="text-gray-600 font-normal">(Optional)</span></label>
                  <input 
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div className="bg-black/40 p-6 rounded-2xl border border-white/10 mt-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative overflow-hidden flex justify-between items-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <span className="text-sm text-gray-400 font-bold uppercase tracking-widest relative z-10">Total Bill:</span>
                <span className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] relative z-10">₹{formData.totalPrice}</span>
              </div>

              <button 
                type="submit" 
                disabled={products.length === 0} 
                className="w-full bg-accent hover:bg-white text-dark disabled:bg-white/10 disabled:text-gray-500 font-black tracking-wide py-5 rounded-xl transition-all duration-300 mt-8 shadow-[0_0_20px_rgba(212,163,115,0.4)] text-lg"
              >
                COMPLETE SALE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
