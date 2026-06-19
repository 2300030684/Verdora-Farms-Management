import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, LogOut, CheckCircle, Package, FileText, Leaf, X, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

const Storefront = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null); // null, 'processing', 'success'
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutData, setCheckoutData] = useState({ 
    quantity: 1, 
    paymentMethod: 'CASH_ON_DELIVERY',
    address: '',
    phone: user?.mobileNumber || ''
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
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        // Only show products that have stock
        setProducts(response.data.filter(p => p.stockQuantity > 0));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBuyClick = (product) => {
    setCheckoutProduct(product);
    setCheckoutData({ 
      quantity: 1, 
      paymentMethod: 'CASH_ON_DELIVERY',
      address: '',
      phone: user?.mobileNumber || ''
    });
  };

  const confirmOrder = async () => {
    try {
      setOrderStatus('processing');
      await api.post('/sales', {
        product: { id: checkoutProduct.id },
        quantity: checkoutData.quantity,
        saleType: 'ONLINE',
        customerName: user.name || 'Online Customer',
        customerPhone: checkoutData.phone,
        customerAddress: checkoutData.address,
        totalPrice: checkoutProduct.price * checkoutData.quantity,
        paymentMethod: checkoutData.paymentMethod
      });
      
      setOrderStatus('success');
      setCheckoutProduct(null);
      
      // Reduce local stock immediately for UI feeling
      setProducts(products.map(p => {
        if (p.id === checkoutProduct.id) {
          return { ...p, stockQuantity: p.stockQuantity - checkoutData.quantity };
        }
        return p;
      }).filter(p => p.stockQuantity > 0));

      setTimeout(() => {
        setOrderStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Sorry, there was an error processing your order.');
      setOrderStatus(null);
    }
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
              <Link to="/store" className="text-sm font-bold text-dark bg-accent hover:bg-white transition-colors flex items-center px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(212,163,115,0.4)]">
                <ShoppingBag className="w-4 h-4 mr-2" /> Shop
              </Link>
              <Link to="/my-orders" className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center px-4 py-2.5 rounded-xl">
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Leaf className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent tracking-[0.2em] uppercase">100% Pure & Natural</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl">
            Farm Fresh To Your <span className="text-accent">Doorstep</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Browse our selection of premium, organic dairy products produced right here on Verdora Farms. Guaranteed fresh, every single day.
          </p>
        </div>

        {orderStatus === 'success' && (
          <div className="mb-10 p-5 bg-green-500/20 border border-green-500/50 backdrop-blur-md rounded-2xl flex items-center justify-center space-x-3 text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-fade-in-down">
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold text-lg">Order placed successfully! We are preparing it for delivery.</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin drop-shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-[#141f17]/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
            <Package className="w-20 h-20 mx-auto text-white/20 mb-6" />
            <h2 className="text-3xl font-black text-white mb-3">Sold Out</h2>
            <p className="text-gray-400 text-lg">We are currently out of stock on all premium items. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-[#141f17]/70 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:shadow-[0_0_40px_rgba(28,81,44,0.4)] hover:border-accent/50 transition-all duration-500 group flex flex-col">
                <div className="h-56 bg-black/40 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141f17] to-transparent z-10 opacity-60"></div>
                  <span className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dark rounded-full shadow-lg z-20">
                    {product.category || 'Premium'}
                  </span>
                  {getDisplayImage(product) ? (
                    <img src={getDisplayImage(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 opacity-90 group-hover:opacity-100" />
                  ) : (
                    <Package className="w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow relative z-20 -mt-6">
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{product.name}</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">Farm fresh organic {product.category?.toLowerCase() || 'dairy'}, crafted with care.</p>
                  
                  <div className="mt-auto">
                    <div className="flex items-end justify-between mb-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-accent/80 uppercase tracking-wider mb-1">Price</span>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-black text-white">₹{product.price}</span>
                          <span className="text-sm font-medium text-gray-500 ml-1">/{product.unit}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Stock</span>
                        <span className="text-xs font-bold text-primary bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg">
                          {product.stockQuantity} Left
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleBuyClick(product)}
                      disabled={orderStatus === 'processing'}
                      className="w-full bg-primary hover:bg-secondary disabled:bg-gray-700 text-white font-black py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(28,81,44,0.4)] hover:shadow-[0_0_30px_rgba(212,163,115,0.3)] flex items-center justify-center border border-white/10 overflow-hidden relative group"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                      <ShoppingBag className="w-5 h-5 mr-2" /> 
                      <span className="tracking-wide uppercase">Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checkout Modal */}
        {checkoutProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-[#141f17] border border-white/10 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
              
              <div className="p-6 bg-white/5 border-b border-white/10 relative">
                <button onClick={() => setCheckoutProduct(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-black/40 p-2 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-black text-white tracking-wide">Secure Checkout</h3>
                <p className="text-sm text-gray-400 mt-1">Complete your purchase</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Product Summary */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-black/40 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                    {getDisplayImage(checkoutProduct) ? (
                      <img src={getDisplayImage(checkoutProduct)} alt="Product" className="w-full h-full object-cover opacity-90" />
                    ) : (
                      <Package className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{checkoutProduct.name}</h4>
                    <p className="text-accent font-black text-lg">₹{checkoutProduct.price} <span className="text-sm text-gray-500 font-medium">/ {checkoutProduct.unit}</span></p>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Quantity</label>
                  <div className="flex items-center bg-black/40 rounded-xl border border-white/10 p-2 shadow-inner w-max">
                    <button 
                      onClick={() => setCheckoutData(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))}
                      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors flex items-center justify-center"
                    >-</button>
                    <span className="w-16 text-center font-black text-white text-lg">{checkoutData.quantity}</span>
                    <button 
                      onClick={() => setCheckoutData(prev => ({...prev, quantity: Math.min(checkoutProduct.stockQuantity, prev.quantity + 1)}))}
                      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors flex items-center justify-center"
                    >+</button>
                  </div>
                </div>

                {/* Delivery Details */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Delivery Details</label>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Contact Number" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm shadow-inner"
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})}
                      required
                    />
                    <textarea 
                      placeholder="Full Delivery Address (Required)" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all resize-none h-20 text-sm shadow-inner"
                      value={checkoutData.address}
                      onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Payment Options */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Select Payment Method</label>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${checkoutData.paymentMethod === 'UPI' ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                      <input type="radio" name="payment" value="UPI" checked={checkoutData.paymentMethod === 'UPI'} onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})} className="hidden" />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${checkoutData.paymentMethod === 'UPI' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-bold text-sm ${checkoutData.paymentMethod === 'UPI' ? 'text-white' : 'text-gray-300'}`}>Pay via UPI</h5>
                        <p className="text-xs text-gray-500">GPay, PhonePe, Paytm</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checkoutData.paymentMethod === 'UPI' ? 'border-blue-500' : 'border-gray-600'}`}>
                        {checkoutData.paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                      </div>
                    </label>

                    <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${checkoutData.paymentMethod === 'CARD' ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                      <input type="radio" name="payment" value="CARD" checked={checkoutData.paymentMethod === 'CARD'} onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})} className="hidden" />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${checkoutData.paymentMethod === 'CARD' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-bold text-sm ${checkoutData.paymentMethod === 'CARD' ? 'text-white' : 'text-gray-300'}`}>Credit / Debit Card</h5>
                        <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checkoutData.paymentMethod === 'CARD' ? 'border-purple-500' : 'border-gray-600'}`}>
                        {checkoutData.paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                      </div>
                    </label>

                    <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${checkoutData.paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                      <input type="radio" name="payment" value="CASH_ON_DELIVERY" checked={checkoutData.paymentMethod === 'CASH_ON_DELIVERY'} onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})} className="hidden" />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${checkoutData.paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-bold text-sm ${checkoutData.paymentMethod === 'CASH_ON_DELIVERY' ? 'text-white' : 'text-gray-300'}`}>Cash on Delivery</h5>
                        <p className="text-xs text-gray-500">Pay when you receive</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checkoutData.paymentMethod === 'CASH_ON_DELIVERY' ? 'border-emerald-500' : 'border-gray-600'}`}>
                        {checkoutData.paymentMethod === 'CASH_ON_DELIVERY' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Total & Button */}
              <div className="p-6 bg-black/60 border-t border-white/10 mt-auto">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-3xl font-black text-white">₹{checkoutProduct.price * checkoutData.quantity}</span>
                </div>
                <button 
                  onClick={confirmOrder}
                  disabled={orderStatus === 'processing' || !checkoutData.address?.trim() || !checkoutData.phone?.trim()}
                  className="w-full bg-accent hover:bg-white text-dark disabled:bg-white/10 disabled:text-gray-500 font-black tracking-wide py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(212,163,115,0.4)] flex items-center justify-center"
                >
                  {orderStatus === 'processing' ? (
                    <div className="w-6 h-6 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Confirm Order <CheckCircle className="w-5 h-5 ml-2" /></>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Storefront;
