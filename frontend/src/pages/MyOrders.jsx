import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, LogOut, Package, FileText, Calendar, CreditCard, ChevronRight } from 'lucide-react';

const MyOrders = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/sales');
        // Filter orders for the current customer
        const myOrders = response.data.filter(order => order.customerPhone === user.mobileNumber);
        
        // Sort by date descending
        myOrders.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        
        setOrders(myOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-dark font-sans relative overflow-x-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/auth_bg.png" 
          alt="Dairy Farm Background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#141f17]/80 to-[#0a120e] mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-[#0a120e]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/store" className="flex items-center space-x-3 group">
              <img src="/verdora-logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-accent/40 group-hover:border-accent transition-colors shadow-lg" />
              <span className="text-2xl font-black tracking-tighter text-white group-hover:text-accent transition-colors">
                Verdora Farms <span className="text-accent/70 font-light tracking-normal text-lg ml-1">Store</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/store" className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center px-4 py-2.5 rounded-xl">
                <ShoppingBag className="w-4 h-4 mr-2" /> Shop
              </Link>
              <Link to="/my-orders" className="text-sm font-bold text-dark bg-accent hover:bg-white transition-colors flex items-center px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(212,163,115,0.4)]">
                <FileText className="w-4 h-4 mr-2" /> My Orders
              </Link>
              <span className="text-sm font-medium text-gray-400 hidden sm:block border-l border-white/20 pl-4 ml-2">
                Welcome, <span className="text-white">{user?.name || 'Customer'}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors p-2.5 rounded-xl hover:bg-red-500/10 ml-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
            Order <span className="text-accent">History</span>
          </h1>
          <p className="text-lg text-gray-400">Track and review all your past purchases from Verdora Farms.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin drop-shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 bg-[#141f17]/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-white/30" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">No Orders Yet</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md">You haven't placed any orders yet. Visit our store to explore premium farm-fresh products.</p>
            <Link to="/store" className="bg-accent hover:bg-white text-dark font-bold py-3.5 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(212,163,115,0.4)]">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#141f17]/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
                <div className="px-6 py-4 bg-black/40 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order #{order.id}</p>
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="w-4 h-4 mr-2 text-accent" />
                        {formatDate(order.saleDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Processing</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                        {order.product?.name || 'Unknown Product'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Quantity: <span className="text-white font-bold">{order.quantity} {order.product?.unit}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</span>
                      <div className="flex items-center text-3xl font-black text-accent">
                        ₹{order.totalPrice}
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : 'ONLINE PAYMENT'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex justify-end">
                  <button className="text-sm font-bold text-accent hover:text-white transition-colors flex items-center">
                    View Receipt <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
