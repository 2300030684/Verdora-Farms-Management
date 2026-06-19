import React, { useContext, useState, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown, AlertTriangle, Syringe, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/cattle');
      const cattle = response.data;
      const newAlerts = [];
      const now = new Date();

      cattle.forEach(cow => {
        // Check for Sickness
        if (cow.healthStatus && cow.healthStatus.toLowerCase() === 'sick') {
          newAlerts.push({
            id: `sick-${cow.id}`,
            type: 'sick',
            title: `Sick Cattle Detected`,
            message: `Cattle #${cow.tagNumber} is currently marked as Sick. Immediate attention required.`,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
        }

        // Check for Vaccination Overdue (180 days)
        if (cow.lastVaccinationDate) {
          const vacDate = new Date(cow.lastVaccinationDate);
          const diffTime = Math.abs(now - vacDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 180) {
            newAlerts.push({
              id: `vac-${cow.id}`,
              type: 'vaccine',
              title: `Vaccination Overdue`,
              message: `Cattle #${cow.tagNumber} has not been vaccinated in ${diffDays} days.`,
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });
          }
        }
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-8 z-10 relative shadow-md">
      <div className="flex-1">
        <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Overview</h2>
      </div>
      <div className="flex items-center space-x-4">
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => { setIsAlertsOpen(!isAlertsOpen); setIsDropdownOpen(false); }}
            className="p-2.5 rounded-xl hover:bg-white/10 relative text-gray-300 hover:text-white transition-all duration-300 border border-transparent hover:border-white/20"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white/50 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </button>

          {/* Alerts Dropdown */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-black/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/40 backdrop-blur-md z-10">
                <h3 className="font-bold text-white">Alerts & Notifications</h3>
                <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">{alerts.length} New</span>
              </div>
              
              {alerts.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                  <CheckCircle className="w-12 h-12 text-accent/80 mb-3 drop-shadow-md" />
                  <p className="text-sm font-bold text-white">All Clear!</p>
                  <p className="text-xs mt-1 text-gray-400">Your herd is healthy and up to date.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="px-4 py-4 border-b border-white/5 hover:bg-white/5 transition-all flex items-start">
                      <div className={`p-2.5 rounded-xl mr-3 mt-1 flex-shrink-0 border ${alert.type === 'sick' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' : 'bg-accent/10 text-accent border-accent/20 shadow-[inset_0_0_10px_rgba(212,163,115,0.2)]'}`}>
                        {alert.type === 'sick' ? <AlertTriangle className="w-5 h-5" /> : <Syringe className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${alert.type === 'sick' ? 'text-red-400' : 'text-accent'}`}>{alert.title}</h4>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{alert.message}</p>
                        <span className="text-[10px] text-gray-500 mt-1.5 block">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="relative">
          <div 
            onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsAlertsOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 pr-4 rounded-full transition-all duration-300 border border-transparent hover:border-white/10"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shadow-[0_0_15px_rgba(212,163,115,0.2)]">
              <User className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-wide text-white text-sm hidden sm:block">
              {user ? user.name : 'Guest User'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-black/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-1 z-50">
              <div className="px-5 py-3 border-b border-white/10 mb-1">
                <p className="text-sm font-bold text-white tracking-wide">{user ? user.name : 'Guest'}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user ? user.mobileNumber : ''}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors font-medium tracking-wide"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
