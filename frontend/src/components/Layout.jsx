import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen bg-dark font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/40 via-dark to-dark text-white relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-full z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
