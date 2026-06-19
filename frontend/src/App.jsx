import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Farmers = React.lazy(() => import('./pages/Farmers'));
const Cattle = React.lazy(() => import('./pages/Cattle'));
const MilkTracking = React.lazy(() => import('./pages/MilkTracking'));
const Procurement = React.lazy(() => import('./pages/Procurement'));
const Predictions = React.lazy(() => import('./pages/Predictions'));
const AIAssistant = React.lazy(() => import('./pages/AIAssistant'));
const Users = React.lazy(() => import('./pages/Users'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Sales = React.lazy(() => import('./pages/Sales'));
const Storefront = React.lazy(() => import('./pages/Storefront'));
const MyOrders = React.lazy(() => import('./pages/MyOrders'));
const Finance = React.lazy(() => import('./pages/Finance'));
const Workers = React.lazy(() => import('./pages/Workers'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && user.roles) {
    const hasRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      if (user.roles.includes('ROLE_CUSTOMER')) return <Navigate to="/store" replace />;
      return <Navigate to="/" replace />;
    }
  }

  // If trying to access customer portal but is admin, redirect to admin
  if (allowedRoles && allowedRoles.includes('ROLE_CUSTOMER') && !user.roles?.includes('ROLE_CUSTOMER')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center text-primary font-bold text-xl">Loading Verdora Farms...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<PrivateRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/" element={<Layout />}>
                {/* All internal modules are strictly Admin-only */}
                <Route index element={<Dashboard />} />
                <Route path="records" element={<MilkTracking />} />
                <Route path="assistant" element={<AIAssistant />} />
                <Route path="farmers" element={<Farmers />} />
                <Route path="cattle" element={<Cattle />} />
                <Route path="procurement" element={<Procurement />} />
                <Route path="predictions" element={<Predictions />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="sales" element={<Sales />} />
                <Route path="users" element={<Users />} />
                <Route path="workers" element={<Workers />} />
                <Route path="finance" element={<Finance />} />
              </Route>
            </Route>

            <Route element={<PrivateRoute allowedRoles={['ROLE_CUSTOMER']} />}>
              <Route path="/store" element={<Storefront />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
