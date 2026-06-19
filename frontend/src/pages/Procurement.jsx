import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, Plus, Edit2, Trash2, X, Calculator, FileText, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Procurement = () => {
  const [purchases, setPurchases] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [formData, setFormData] = useState({ 
    farmerId: '', 
    quantityLiters: '', 
    fatPercentage: '', 
    snfPercentage: '', 
    pricePerLiter: '', 
    totalPrice: '',
    paymentStatus: 'PAID',
    paymentMethod: 'CASH'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [purchasesRes, farmersRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/farmers')
      ]);
      setPurchases(purchasesRes.data);
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

  // Auto calculate price whenever Fat, SNF, or Quantity changes
  useEffect(() => {
    const fat = parseFloat(formData.fatPercentage) || 0;
    const snf = parseFloat(formData.snfPercentage) || 0;
    const qty = parseFloat(formData.quantityLiters) || 0;
    
    // Standard Dairy Formula: Price = (Fat * 6.5) + (SNF * 2.5)
    if (fat > 0 || snf > 0) {
      const pricePerL = (fat * 6.5) + (snf * 2.5);
      const total = pricePerL * qty;
      
      setFormData(prev => ({
        ...prev,
        pricePerLiter: pricePerL.toFixed(2),
        totalPrice: total.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        pricePerLiter: '',
        totalPrice: ''
      }));
    }
  }, [formData.fatPercentage, formData.snfPercentage, formData.quantityLiters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantityLiters: parseFloat(formData.quantityLiters),
        fatPercentage: parseFloat(formData.fatPercentage),
        snfPercentage: parseFloat(formData.snfPercentage),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        totalPrice: parseFloat(formData.totalPrice),
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentStatus === 'PAID' ? formData.paymentMethod : null
      };

      let savedPurchase;
      if (editingId) {
        const res = await api.put(`/purchases/${editingId}`, payload);
        savedPurchase = res.data;
      } else {
        const res = await api.post(`/purchases/${formData.farmerId}`, payload);
        savedPurchase = res.data;
      }

      if (sendWhatsApp) {
        const farmer = farmers.find(f => f.id === parseInt(formData.farmerId) || f.id === formData.farmerId);
        const purchaseForMsg = {
          ...payload,
          ...savedPurchase,
          farmer: savedPurchase?.farmer || farmer,
          purchaseDate: savedPurchase?.purchaseDate || new Date().toISOString()
        };
        sendWhatsAppMessage(purchaseForMsg);
      }

      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Error logging purchase. Please check values and try again.');
    }
  };

  const handleEditClick = (purchase) => {
    setFormData({
      farmerId: purchase.farmer?.id || (farmers.length > 0 ? farmers[0].id : ''),
      quantityLiters: purchase.quantityLiters,
      fatPercentage: purchase.fatPercentage,
      snfPercentage: purchase.snfPercentage,
      pricePerLiter: purchase.pricePerLiter,
      totalPrice: purchase.totalPrice,
      paymentStatus: purchase.paymentStatus || 'PAID',
      paymentMethod: purchase.paymentMethod || 'CASH'
    });
    setEditingId(purchase.id);
    setSendWhatsApp(false);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase record? The farmer's total milk will be adjusted automatically.")) {
      try {
        await api.delete(`/purchases/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting purchase:', error);
      }
    }
  };

  const generatePDF = (purchase) => {
    // Load the image asynchronously
    const img = new Image();
    img.src = '/verdora-logo.jpg';
    
    img.onload = () => {
      const doc = new jsPDF();
      const dateStr = new Date(purchase.purchaseDate).toLocaleString();
      const farmerName = purchase.farmer?.name || 'Unknown';
      const farmerPhone = purchase.farmer?.phone || 'N/A';

      // 1. Add Logo
      doc.addImage(img, 'JPEG', 14, 15, 25, 25);

      // 2. Company Name & Premium Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 184, 166); // Teal accent
      doc.text("VERDORA FARMS", 43, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("123 Dairy Lane, Countryside Region", 43, 30);
      doc.text("Contact: +1 (555) 123-4567 | support@verdorafarms.com", 43, 36);
      
      // Line separator
      doc.setDrawColor(20, 184, 166);
      doc.setLineWidth(1);
      doc.line(14, 45, 196, 45);

      // 3. Receipt Title Centered below the line
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text("OFFICIAL MILK PROCUREMENT RECEIPT", 105, 55, { align: "center" });

      // 4. Transaction Info
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text("RECEIPT DETAILS", 14, 68);
      doc.text("VENDOR DETAILS", 120, 68);

      doc.setFont("helvetica", "normal");
      doc.text(`Receipt ID: #${purchase.id}`, 14, 76);
      doc.text(`Date: ${dateStr}`, 14, 83);
      
      doc.text(`Name: ${farmerName}`, 120, 76);
      doc.text(`Phone: ${farmerPhone}`, 120, 83);

      // 5. Procurement Data Table
      const tableData = [
        ["Volume Received", `${purchase.quantityLiters} Liters`],
        ["Fat Percentage", `${purchase.fatPercentage}%`],
        ["SNF Percentage", `${purchase.snfPercentage}%`],
        ["Base Rate Per Liter", `Rs. ${purchase.pricePerLiter}`]
      ];

      autoTable(doc, {
        startY: 95,
        head: [["Description", "Value"]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], textColor: 255, fontSize: 12, fontStyle: 'bold' },
        bodyStyles: { fontSize: 11, textColor: 50 },
        alternateRowStyles: { fillColor: [245, 250, 248] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 68, halign: 'right' }
        }
      });

      // 6. Total Amount Highlight
      const finalY = doc.lastAutoTable?.finalY || 130;
      
      doc.setFillColor(240, 253, 250); // Light teal background
      doc.setDrawColor(20, 184, 166);
      doc.rect(100, finalY + 10, 82, 25, 'FD');
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("TOTAL PAYOUT", 105, finalY + 20);

      doc.setFontSize(18);
      doc.setTextColor(20, 184, 166);
      doc.text(`Rs. ${purchase.totalPrice}`, 177, finalY + 27, { align: "right" });
      
      // Payment Status Banner
      const isPaid = purchase.paymentStatus !== 'PENDING';
      const statusColor = isPaid ? [52, 211, 153] : [239, 68, 68]; // Emerald vs Red
      const statusText = isPaid ? "PAID IN FULL" : "PAYMENT PENDING";
      
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(14, finalY + 10, 80, 25, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(statusText, 54, finalY + 25, { align: "center" });

      // 7. Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for partnering with Verdora Farms.", 105, 270, { align: "center" });
      doc.text("This is a computer-generated receipt and requires no signature.", 105, 275, { align: "center" });

      // Save
      doc.save(`Verdora_Receipt_${purchase.id}.pdf`);
    };

    img.onerror = () => {
      // Fallback if image fails to load
      alert("Error generating premium PDF. Please try again.");
    };
  };

  const sendWhatsAppMessage = (purchase) => {
    const farmerName = purchase.farmer?.name || 'Farmer';
    const farmerPhone = purchase.farmer?.phone;
    
    if (!farmerPhone) {
      alert("This farmer does not have a phone number registered. Please update their profile first.");
      return;
    }

    const dateStr = new Date(purchase.purchaseDate).toLocaleDateString();
    const isPaid = purchase.paymentStatus !== 'PENDING';
    const statusText = isPaid ? "PAID IN FULL" : "PAYMENT PENDING";

    const message = `*VERDORA FARMS - Milk Receipt* 🥛
--------------------------
*Date:* ${dateStr}
*Farmer:* ${farmerName}
*Volume Received:* ${purchase.quantityLiters} Liters
*Quality:* Fat ${purchase.fatPercentage}% | SNF ${purchase.snfPercentage}%
*Rate:* ₹${purchase.pricePerLiter} per Liter
--------------------------
*TOTAL PAYOUT:* ₹${purchase.totalPrice}
*STATUS:* ${statusText}

Thank you for your business! 🚜`;

    // Remove any non-numeric characters from the phone number except the leading +
    const cleanPhone = farmerPhone.replace(/(?!^\+)[^\d]/g, '');
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setSendWhatsApp(false);
    setFormData({ 
      farmerId: farmers.length > 0 ? farmers[0].id : '', 
      quantityLiters: '', 
      fatPercentage: '', 
      snfPercentage: '', 
      pricePerLiter: '', 
      totalPrice: '',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Milk Procurement</h2>
            <p className="text-sm text-gray-400 mt-1">Buy bulk milk from local farmers</p>
          </div>
        </div>
        <button 
          onClick={() => { closeModal(); setShowModal(true); }}
          className="bg-accent hover:bg-white text-dark hover:text-dark px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 font-bold shadow-[0_0_15px_rgba(212,163,115,0.4)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Log Purchase
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          <span className="font-bold tracking-widest uppercase text-sm">Loading purchases...</span>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
          <Truck className="w-16 h-16 mx-auto text-white/20 mb-4 drop-shadow-lg" />
          <p className="text-xl font-bold text-white tracking-wide">No bulk purchases recorded</p>
          <p className="text-sm mt-2 text-gray-500">Log a new purchase to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 border-b border-white/10 text-sm tracking-wider uppercase">
                <th className="p-5 font-bold">Date</th>
                <th className="p-5 font-bold">Farmer Name</th>
                <th className="p-5 font-bold">Volume</th>
                <th className="p-5 font-bold">Quality (Fat/SNF)</th>
                <th className="p-5 font-bold">Rate (/L)</th>
                <th className="p-5 font-bold">Total Paid</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="p-5 text-gray-400 font-medium text-sm">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                  <td className="p-5 font-bold text-white tracking-wide">{purchase.farmer?.name || 'Unknown'}</td>
                  <td className="p-5 text-accent font-black text-lg">{purchase.quantityLiters} L</td>
                  <td className="p-5 text-gray-300 font-medium text-sm">{purchase.fatPercentage}% / {purchase.snfPercentage}%</td>
                  <td className="p-5 text-gray-300 font-medium text-sm">₹{purchase.pricePerLiter}</td>
                  <td className="p-5 font-black text-emerald-400 text-lg drop-shadow-lg">₹{purchase.totalPrice}</td>
                  <td className="p-5">
                    {purchase.paymentStatus === 'PENDING' ? (
                      <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">PENDING</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(52,211,153,0.2)]">PAID</span>
                    )}
                  </td>
                  <td className="p-5 flex justify-end space-x-2 items-center">
                    {purchase.paymentStatus === 'PENDING' && (
                      <button 
                        onClick={async () => {
                          try {
                            await api.put(`/purchases/${purchase.id}`, { ...purchase, paymentStatus: 'PAID' });
                            fetchData();
                          } catch(e) { console.error(e); }
                        }} 
                        className="text-yellow-400 hover:text-white hover:bg-yellow-500/50 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors" title="Mark as Paid">
                        PAY NOW
                      </button>
                    )}
                    <button onClick={() => sendWhatsAppMessage(purchase)} className="text-green-400 hover:text-white hover:bg-green-500/50 bg-green-500/20 border border-green-500/30 p-2 rounded-lg transition-colors" title="Send WhatsApp Receipt">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => generatePDF(purchase)} className="text-gray-400 hover:text-white hover:bg-emerald-500/50 bg-emerald-500/20 border border-emerald-500/30 p-2 rounded-lg transition-colors" title="Download Receipt">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEditClick(purchase)} className="text-blue-400 hover:text-white hover:bg-blue-500/50 bg-blue-500/20 border border-blue-500/30 p-2 rounded-lg transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(purchase.id)} className="text-red-400 hover:text-white hover:bg-red-500/50 bg-red-500/20 border border-red-500/30 p-2 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#141f17] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">{editingId ? 'Edit Purchase' : 'Log Milk Purchase'}</h3>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
              <Calculator className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-300 tracking-wide uppercase">Auto-Pricing Enabled</h4>
                <p className="text-xs text-blue-400 mt-1 opacity-80">Price is automatically calculated using the standard formula: <br/><code className="bg-black/40 px-2 py-1 rounded text-blue-200 mt-2 inline-block font-mono">(Fat% × ₹6.5) + (SNF% × ₹2.5)</code></p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!editingId && (
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Select Farmer</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.farmerId} onChange={e => setFormData({...formData, farmerId: e.target.value})}
                    required
                  >
                    {farmers.length === 0 ? <option value="" className="bg-dark">No farmers available</option> : null}
                    {farmers.map(f => <option key={f.id} value={f.id} className="bg-dark">{f.name} (Phone: {f.phone})</option>)}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Volume Received (Liters)</label>
                <input 
                  type="number" required min="0" step="0.1"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] text-xl font-black"
                  value={formData.quantityLiters} onChange={e => setFormData({...formData, quantityLiters: e.target.value})}
                  placeholder="e.g. 25.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Fat %</label>
                  <input 
                    type="number" required min="0" max="10" step="0.1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.fatPercentage} onChange={e => setFormData({...formData, fatPercentage: e.target.value})}
                    placeholder="e.g. 4.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">SNF %</label>
                  <input 
                    type="number" required min="0" max="15" step="0.1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.snfPercentage} onChange={e => setFormData({...formData, snfPercentage: e.target.value})}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>

              <div className="bg-black/40 p-5 rounded-2xl border border-white/10 mt-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Rate Per Liter:</span>
                  <span className="text-xl font-bold text-white">
                    {formData.pricePerLiter ? `₹${formData.pricePerLiter}` : '---'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10 relative z-10">
                  <span className="text-md text-white font-black uppercase tracking-widest">Total Payout:</span>
                  <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                    {formData.totalPrice ? `₹${formData.totalPrice}` : '---'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Payment Status</label>
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, paymentStatus: 'PAID'})}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${formData.paymentStatus === 'PAID' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    PAID IMMEDIATELY
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, paymentStatus: 'PENDING'})}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${formData.paymentStatus === 'PENDING' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    PAYMENT PENDING
                  </button>
                </div>
              </div>

              {formData.paymentStatus === 'PAID' && (
                <div className="animate-fade-in-down">
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Payment Method</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    value={formData.paymentMethod} 
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="CASH" className="bg-dark">Cash</option>
                    <option value="UPI" className="bg-dark">UPI (GPay, PhonePe, Paytm)</option>
                    <option value="BANK_TRANSFER" className="bg-dark">Bank Transfer / NEFT</option>
                  </select>
                </div>
              )}

              <div className="flex items-center space-x-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <input 
                  type="checkbox" 
                  id="sendWhatsApp"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500/50 bg-black/40 cursor-pointer"
                />
                <label htmlFor="sendWhatsApp" className="flex items-center cursor-pointer select-none">
                  <MessageCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-sm font-bold text-gray-300">Send WhatsApp Receipt to Farmer</span>
                </label>
              </div>

              <button type="submit" disabled={!editingId && farmers.length === 0} className="w-full bg-accent hover:bg-white text-dark disabled:bg-white/10 disabled:text-gray-500 font-black tracking-wide py-5 rounded-xl transition-all duration-300 mt-8 shadow-[0_0_20px_rgba(212,163,115,0.4)] text-lg">
                {editingId ? 'UPDATE PURCHASE' : 'CONFIRM PURCHASE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procurement;
