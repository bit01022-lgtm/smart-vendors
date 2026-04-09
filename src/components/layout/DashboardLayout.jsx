import React from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

// DashboardLayout: Fixed sidebar, optional header, main content area
const DashboardLayout = ({ children, title, header }) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed z-20 h-full w-56 flex-shrink-0 bg-slate-900 text-white">
        <Sidebar />
      </aside>
      {/* Main content wrapper */}
      <div className="ml-56 flex min-h-screen flex-1 flex-col">
        {/* Optional top header */}
        <header className="sticky top-0 z-10 flex flex-col bg-white shadow">
          <Navbar />
          {title && (
            <div className="py-2 text-center">
              <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-800">{title}</h1>
              {header && <div className="mt-1">{header}</div>}
            </div>
          )}
        </header>
        {/* Main content area */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
