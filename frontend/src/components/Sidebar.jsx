import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Activity as Cow, Droplet, Activity, Bot, LogOut, Truck, Shield, PackageSearch, ShoppingCart, DollarSign, UserCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/', roles: ['ROLE_ADMIN'] },
    { icon: Cow, label: 'Cattle Directory', path: '/cattle', roles: ['ROLE_ADMIN'] },
    { icon: UserCheck, label: 'Workers & Payroll', path: '/workers', roles: ['ROLE_ADMIN'] },
    { icon: Users, label: 'Farmers & Vendors', path: '/farmers', roles: ['ROLE_ADMIN'] },
    { icon: Droplet, label: 'Milk Records', path: '/records', roles: ['ROLE_ADMIN'] },
    { icon: Truck, label: 'Procurement', path: '/procurement', roles: ['ROLE_ADMIN'] },
    { icon: PackageSearch, label: 'Product Inventory', path: '/inventory', roles: ['ROLE_ADMIN'] },
    { icon: ShoppingCart, label: 'Point of Sale (POS)', path: '/sales', roles: ['ROLE_ADMIN'] },
    { icon: Activity, label: 'Predictions', path: '/predictions', roles: ['ROLE_ADMIN'] },
    { icon: Bot, label: 'AI Assistant', path: '/assistant', roles: ['ROLE_ADMIN'] },
    { icon: Shield, label: 'User Management', path: '/users', roles: ['ROLE_ADMIN'] },
    { icon: DollarSign, label: 'Financial Ledger', path: '/finance', roles: ['ROLE_ADMIN'] },
  ];

  // Filter menu items based on the user's role
  const menuItems = allMenuItems.filter(item => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => item.roles.includes(role));
  });

  return (
    <aside className="w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 text-white min-h-screen flex flex-col shadow-2xl relative z-20">
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <img src="/verdora-logo.jpg" alt="Verdora Farms Logo" className="h-28 w-28 object-cover rounded-full shadow-[0_0_20px_rgba(212,163,115,0.3)] border border-accent/40" />
      </div>
      <nav className="flex-1 mt-6">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-2 px-4">
              <NavLink 
                to={item.path} 
                className={({isActive}) => `group flex items-center p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-accent/10 text-accent shadow-[inset_0_0_20px_rgba(212,163,115,0.05)] border border-accent/30' : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'}`}
              >
                {({isActive}) => (
                  <>
                    <item.icon className={`w-5 h-5 mr-3 transition-colors duration-300 ${isActive ? 'text-accent' : 'group-hover:text-accent'}`} />
                    <span className="font-medium tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all duration-300 group">
          <LogOut className="w-5 h-5 mr-3 group-hover:text-red-400 transition-colors" />
          <span className="font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
