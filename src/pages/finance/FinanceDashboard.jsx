
import React, { useState } from "react";
import MainLayout from '../../components/layout/MainLayout';

import '../../styles/DashboardStyles.css';

function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("viewInvoices");
  const [invoices, setInvoices] = useState(() => {
    const stored = localStorage.getItem('vendorInvoices');
    return stored ? JSON.parse(stored) : [];
  });
  const [notifications, setNotifications] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editInvoice, setEditInvoice] = useState({});
  const [filters, setFilters] = useState({ vendor: "", poNumber: "", status: "", amount: "" });

  // Notification logic
  const showNotification = (msg) => {
    setNotifications((prev) => [...prev, msg]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 3000);
  };

  // Edit logic
  const handleEdit = (invoice) => {
    setEditId(invoice.id);
    setEditInvoice({ ...invoice });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditInvoice((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === editId ? { ...editInvoice, amount: Number(editInvoice.amount) } : inv))
    );
    setEditId(null);
    setEditInvoice({});
    showNotification("Invoice updated.");
  };
  const handleEditCancel = () => {
    setEditId(null);
    setEditInvoice({});
  };

  // Delete logic
  const handleDelete = (id) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    showNotification("Invoice deleted.");
  };

  // Download placeholder
  const handleDownload = (id) => {
    showNotification(`Download for invoice ${id} (not implemented)`);
  };

  // Filter logic
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const filteredInvoices = invoices.filter((inv) => {
    return (
      (filters.vendor === "" || inv.vendorName.toLowerCase().includes(filters.vendor.toLowerCase())) &&
      (filters.poNumber === "" || inv.poNumber.toLowerCase().includes(filters.poNumber.toLowerCase())) &&
      (filters.status === "" || inv.status.toLowerCase().includes(filters.status.toLowerCase())) &&
      (filters.amount === "" || String(inv.amount).includes(filters.amount))
    );
  });

  // Payment status logic
  const [paymentStatus, setPaymentStatus] = useState({});
  const handleApprovePayment = (id) => {
    setPaymentStatus((prev) => ({ ...prev, [id]: "Paid" }));
    showNotification("Payment approved.");
  };

  // Summary cards
  const totalPayments = invoices.length;
  const pendingPayments = invoices.filter(inv => (paymentStatus[inv.id] || inv.status) !== "Paid").length;
  const completedPayments = invoices.filter(inv => (paymentStatus[inv.id] || inv.status) === "Paid").length;

  return (
    <MainLayout title="Finance">
      {/* Removed icon space for role as well */}
      <div className="sv-main-content">
        <div className="sv-summary-cards">
          <div className="sv-summary-card sv-summary-total">
            <div className="sv-summary-label">Total Payments</div>
            <div className="sv-summary-value">{totalPayments}</div>
          </div>
          <div className="sv-summary-card sv-summary-pending">
            <div className="sv-summary-label">Pending</div>
            <div className="sv-summary-value">{pendingPayments}</div>
          </div>
          <div className="sv-summary-card sv-summary-completed">
            <div className="sv-summary-label">Completed</div>
            <div className="sv-summary-value">{completedPayments}</div>
          </div>
        </div>
        <div className="sv-tabs">
          <button className={`sv-tab${activeTab === "viewInvoices" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("viewInvoices")}>Handle Invoices</button>
          <button className={`sv-tab${activeTab === "approvePayments" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("approvePayments")}>Approve Payments</button>
          <button className={`sv-tab${activeTab === "trackPayments" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("trackPayments")}>Track Payment Records</button>
        </div>
        <div>
          {notifications.map((msg, idx) => (
            <div className="sv-notification sv-notification-success" key={idx}>{msg}</div>
          ))}
        </div>
        {activeTab === "viewInvoices" && (
          <div className="sv-tab-content">
            <h3>Handle Invoices</h3>
            <div className="sv-table-container">
              <table className="sv-table sv-table-striped sv-table-rounded">
                <thead>
                  <tr>
                    <th>Invoice Name</th>
                    <th>PO Number</th>
                    <th>Amount</th>
                    <th>Document</th>
                    <th>Submission Date</th>
                    <th>Verification</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No invoices found.</td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.name || inv.file || inv.id}</td>
                        <td>{inv.po || inv.poNumber}</td>
                        <td>{inv.amount || '-'}</td>
                        <td>
                          {inv.file ? (
                            <a href={"#"} title={inv.file} style={{textDecoration:'underline',color:'#007bff'}}>{inv.file}</a>
                          ) : (
                            <span style={{color:'#888'}}>No file</span>
                          )}
                        </td>
                        <td>{inv.submissionDate}</td>
                        <td>
                          {(paymentStatus[inv.id] === "Verified" || paymentStatus[inv.id] === "Rejected") ? (
                            <span className={`sv-badge sv-badge-${paymentStatus[inv.id] === "Verified" ? "success" : "danger"}`}>
                              {paymentStatus[inv.id] === "Verified" ? "Approved" : "Rejected"}
                            </span>
                          ) : (
                            <>
                              <button
                                className="sv-btn sv-btn-success sv-btn-highlight"
                                style={{ marginRight: 8, fontWeight: 'bold', boxShadow: '0 0 6px #28a745' }}
                                onClick={() => {
                                  setPaymentStatus(prev => ({ ...prev, [inv.id]: "Verified" }));
                                  showNotification("Invoice marked as Verified.");
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="sv-btn sv-btn-danger sv-btn-highlight"
                                style={{ fontWeight: 'bold', boxShadow: '0 0 6px #dc3545' }}
                                onClick={() => {
                                  setPaymentStatus(prev => ({ ...prev, [inv.id]: "Rejected" }));
                                  showNotification("Invoice marked as Rejected.");
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                        <td>
                          {(paymentStatus[inv.id] === "Verified" || paymentStatus[inv.id] === "Rejected") ? (
                            <span className={`sv-badge sv-badge-${paymentStatus[inv.id] === "Verified" ? "success" : "danger"}`}>
                              {paymentStatus[inv.id] === "Verified" ? "Approved" : "Rejected"}
                            </span>
                          ) : (
                            <span className="sv-badge sv-badge-warning">Pending</span>
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
        {/* Approve Payments and Track Payment Records tabs intentionally left out for this request */}
      </div>
    </MainLayout>
  );
}

export default FinanceDashboard;
