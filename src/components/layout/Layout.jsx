import React from "react";
import "../../styles/DashboardStyles.css";

function Layout({ title, children }) {
  return (
    <div className="sv-layout">
      <header className="sv-header">
        <h1>{title}</h1>
      </header>
      <main className="sv-main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
