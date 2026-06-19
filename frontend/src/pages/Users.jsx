import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users as UsersIcon, Shield, Search } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">Admin</span>;
      case 'ROLE_CUSTOMER':
      default:
        return <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]">Customer</span>;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">User Management</h2>
            <p className="text-sm text-gray-400 mt-1">Directory of all registered accounts in Verdora Farms</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search accounts..." 
            className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>
          <span className="font-bold tracking-widest uppercase text-sm">Loading accounts...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
          <UsersIcon className="w-16 h-16 mx-auto text-white/20 mb-4 drop-shadow-lg" />
          <p className="text-xl font-bold text-white tracking-wide">No users found</p>
          <p className="text-sm mt-2 text-gray-500">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 border-b border-white/10 text-sm tracking-wider uppercase">
                <th className="p-5 font-bold">User ID</th>
                <th className="p-5 font-bold">Full Name</th>
                <th className="p-5 font-bold">Mobile Number</th>
                <th className="p-5 font-bold">Account Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="p-5 text-gray-400 text-sm font-medium">#{u.id}</td>
                  <td className="p-5 font-bold text-white flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/80 to-accent/40 border border-accent/50 flex items-center justify-center text-white font-black shadow-[0_0_10px_rgba(212,163,115,0.3)]">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="tracking-wide">{u.name || 'Unknown'}</span>
                  </td>
                  <td className="p-5 text-gray-300 text-sm font-medium tracking-wide">{u.mobileNumber}</td>
                  <td className="p-5">
                    {getRoleBadge(u.role)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
