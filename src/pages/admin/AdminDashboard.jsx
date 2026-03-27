
import React, { useState, useEffect } from "react";
import { getActivityLogs } from '../../utils/activityLogger';
import MainLayout from '../../components/layout/MainLayout';


const initialVendors = [
  { id: "VND-001", name: "Vendor A", email: "vendorA@example.com", status: "Pending" },
  { id: "VND-002", name: "Vendor B", email: "vendorB@example.com", status: "Pending" },
  { id: "VND-003", name: "Vendor C", email: "vendorC@example.com", status: "Approved" },
];


function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("approveVendors");
  const [vendors, setVendors] = useState(initialVendors);
  const [activityLogs, setActivityLogs] = useState(getActivityLogs());
  const [notifications, setNotifications] = useState([]);

  // Live update activity logs from localStorage
  useEffect(() => {
    const handler = () => setActivityLogs(getActivityLogs());
    window.addEventListener('storage', handler);
    const interval = setInterval(handler, 2000); // also poll in case same tab
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  // Notification logic
  const showNotification = (msg) => {
    setNotifications((prev) => [...prev, msg]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 3000);
  };

  // Approve/Reject logic
  const handleApprove = (id) => {
    setVendors((prev) => prev.map(v => v.id === id ? { ...v, status: "Approved" } : v));
    showNotification(`Vendor ${id} approved.`);
  };
  const handleReject = (id) => {
    setVendors((prev) => prev.map(v => v.id === id ? { ...v, status: "Rejected" } : v));
    showNotification(`Vendor ${id} rejected.`);
  };

  // Dummy stats for reports
  const totalUsers = 12;
  const totalTenders = 8;
  const totalPayments = 5;

  return (
    <MainLayout title="Admin">
      <div className="sv-main-content">
        <div className="sv-summary-cards">
          <div className="sv-summary-card sv-summary-users">
            <div className="sv-summary-label">Total Users</div>
            <div className="sv-summary-value">{totalUsers}</div>
          </div>
          <div className="sv-summary-card sv-summary-tenders">
            <div className="sv-summary-label">Total Tenders</div>
            <div className="sv-summary-value">{totalTenders}</div>
          </div>
          <div className="sv-summary-card sv-summary-payments">
            <div className="sv-summary-label">Total Payments</div>
            <div className="sv-summary-value">{totalPayments}</div>
          </div>
        </div>
        <div className="sv-tabs">
          <button className={`sv-tab${activeTab === "approveVendors" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("approveVendors")}>Approve Vendors</button>
          <button className={`sv-tab${activeTab === "monitorActivity" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("monitorActivity")}>Monitor Procurement Activity</button>
        </div>
        <div>
          {notifications.map((msg, idx) => (
            <div className="sv-notification sv-notification-success" key={idx}>{msg}</div>
          ))}
        </div>
        {activeTab === "approveVendors" && (
          <div>
            <h3>Approve Vendors</h3>
            <div className="sv-table-container">
              <table className="sv-table sv-table-striped sv-table-rounded">
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Vendor Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No vendors found.</td>
                    </tr>
                  ) : (
                    vendors.map((v) => (
                      <tr key={v.id}>
                        <td>{v.id}</td>
                        <td>{v.name}</td>
                        <td>{v.email}</td>
                        <td>{v.status}</td>
                        <td>
                          {v.status === "Pending" && (
                            <>
                              <button
                                className="sv-btn sv-btn-success sv-btn-highlight"
                                style={{ marginRight: 8, fontWeight: 'bold', boxShadow: '0 0 6px #28a745', border: '2px solid #28a745' }}
                                onClick={() => handleApprove(v.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="sv-btn sv-btn-danger sv-btn-highlight"
                                style={{ fontWeight: 'bold', boxShadow: '0 0 6px #dc3545', border: '2px solid #dc3545' }}
                                onClick={() => handleReject(v.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "monitorActivity" && (
          <div>
            <h3>Procurement Activity Logs</h3>
            <div className="sv-table-container">
              <table className="sv-table sv-table-striped sv-table-rounded">
                <thead>
                  <tr>
                    <th>Activity ID</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No activity logs found.</td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.type}</td>
                        <td>{log.reference}</td>
                        <td>{log.user}</td>
                        <td>{log.date}</td>
                        <td>{log.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;

