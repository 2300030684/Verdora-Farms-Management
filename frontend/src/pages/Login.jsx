import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const quotes = [
  "Nurturing the herd is not just farming; it is a sacred bond of love and life.",
  "गौमाता की सेवा केवल कर्म नहीं, यह प्रेम और जीवन का एक पवित्र बंधन है।",
  "పాడిని సాకడం వృత్తి కాదు, ప్రేమ, ప్రాణాలతో పెనవేసుకున్న పవిత్ర బంధం."
];

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(mobileNumber, password);
      navigate('/');
    } catch (err) {
      setError('Invalid mobile number or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-dark">
      {/* Full Screen Background Image */}
      <img 
        src="/auth_bg.png" 
        alt="Dairy Farm Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#12381e]/90"></div>

      {/* Massive Header Section spanning left to right */}
      <div className="relative z-10 w-full flex flex-col items-center text-center px-4 mb-8 sm:mb-12">
        <img src="/verdora-logo.jpg" alt="Verdora Farms Logo" className="h-36 w-36 md:h-48 md:w-48 object-cover rounded-full shadow-2xl border-4 border-primary/40 mb-4" />
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl uppercase leading-none whitespace-nowrap w-full">
          Verdora Farms
        </h1>
        <p className="mt-4 text-xs sm:text-lg md:text-2xl font-bold text-accent tracking-[0.4em] uppercase drop-shadow-lg">
          Fresh • Natural • Healthy
        </p>
      </div>

      {/* Centered Login Form */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-[#141f17]/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="p-3 bg-red-500/20 text-red-200 text-center rounded-lg text-sm font-medium border border-red-500/30">{error}</div>}
            <div className="space-y-5">
              <div>
                <input
                  type="tel"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3.5 border-0 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/20 sm:text-sm backdrop-blur-sm transition-all"
                  placeholder="Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3.5 border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-black/40 backdrop-blur-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-md font-bold rounded-xl text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
            </div>
          </form>
          
          <div className="text-center mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-accent hover:text-white transition-colors">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Inspirational Quotes (Bottom Centered) */}
      <div className="absolute bottom-6 w-full z-10 text-center px-4 hidden md:block">
        <p className="text-2xl md:text-3xl font-medium italic text-white/90 drop-shadow-2xl transition-opacity duration-1000">
          "{quotes[quoteIndex]}"
        </p>
      </div>
    </div>
  );
};

export default Login;
