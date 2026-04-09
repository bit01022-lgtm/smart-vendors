import React from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const MainLayout = ({ children, title }) => {
  const titleColorClass = title?.toLowerCase() === 'vendor'
    ? 'text-emerald-600'
    : title?.toLowerCase() === 'procurement'
    ? 'text-orange-500'
    : title?.toLowerCase() === 'finance'
    ? 'text-violet-600'
    : title?.toLowerCase() === 'admin'
    ? 'text-rose-600'
    : 'text-slate-800';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-20 h-full w-56 bg-slate-900 text-white">
        <Sidebar />
      </aside>
      <div className="ml-56 flex min-h-screen flex-1 flex-col">
        <header className="w-full">
          <Navbar />
          {title && (
            <div className="py-4 text-center">
              {title.toLowerCase() === 'client' ? (
                <h1
                  className="text-2xl font-semibold uppercase tracking-widest text-blue-800"
                >
                  CLIENT
                </h1>
              ) : (
                <div className={`text-xl font-bold uppercase tracking-[0.2em] ${titleColorClass}`}>
                  {title}
                </div>
              )}
            </div>
          )}
        </header>
        <main className="flex min-h-[calc(100vh-80px)] flex-1 justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-8">
          <div className="w-full max-w-5xl rounded-xl bg-white p-8 shadow-xl shadow-slate-200/70">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
