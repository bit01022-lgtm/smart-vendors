import React from "react";

function Layout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
