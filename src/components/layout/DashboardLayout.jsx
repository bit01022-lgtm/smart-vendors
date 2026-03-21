import React from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

// DashboardLayout: Fixed sidebar, optional header, main content area
const DashboardLayout = ({ children, title, header }) => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex-shrink-0 fixed h-full z-20">
        <Sidebar />
      </aside>
      {/* Main content wrapper */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        {/* Optional top header */}
        <header className="sticky top-0 z-10 bg-white shadow flex flex-col">
          <Navbar />
          {title && (
            <div className="text-center mt-2 mb-2">
              <h1 className="text-2xl font-bold tracking-wide uppercase text-gray-800">{title}</h1>
              {header && <div className="mt-1">{header}</div>}
            </div>
          )}
        </header>
        {/* Main content area */}
        <main className="flex-1 p-6 md:p-10 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
