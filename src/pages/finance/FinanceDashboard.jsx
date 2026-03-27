
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
  // Persist verification status in invoice object
  const handleVerifyInvoice = (id, status) => {
    setInvoices((prev) => {
      const updated = prev.map(inv =>
        inv.id === id ? { ...inv, status: status === "Verified" ? "Approved" : "Rejected" } : inv
      );
      localStorage.setItem('vendorInvoices', JSON.stringify(updated));
      return updated;
    });
    showNotification(`Invoice marked as ${status === "Verified" ? "Approved" : "Rejected"}.`);
  };
  // Persist payment status in invoice object
  const handleApprovePayment = (id) => {
    setInvoices((prev) => {
      const updated = prev.map(inv =>
        inv.id === id ? { ...inv, paymentStatus: "Paid" } : inv
      );
      localStorage.setItem('vendorInvoices', JSON.stringify(updated));
      return updated;
    });
    showNotification("Payment approved.");
  };

  // Summary cards
  const totalPayments = invoices.length;
  const pendingPayments = invoices.filter(inv => inv.paymentStatus !== "Paid").length;
  const completedPayments = invoices.filter(inv => inv.paymentStatus === "Paid").length;

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
                            {(inv.status === "Approved" || inv.status === "Rejected") ? (
                              <span className={`sv-badge sv-badge-${inv.status === "Approved" ? "success" : "danger"}`}>
                                {inv.status}
                              </span>
                            ) : (
                              <>
                                <button
                                  className="sv-btn sv-btn-success sv-btn-highlight"
                                  style={{ marginRight: 8, fontWeight: 'bold', boxShadow: '0 0 6px #28a745' }}
                                  onClick={() => {
                                    handleVerifyInvoice(inv.id, "Verified");
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  className="sv-btn sv-btn-danger sv-btn-highlight"
                                  style={{ fontWeight: 'bold', boxShadow: '0 0 6px #dc3545' }}
                                  onClick={() => {
                                    handleVerifyInvoice(inv.id, "Rejected");
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                          <td>
                            {(inv.status === "Approved" || inv.status === "Rejected") ? (
                              <span className={`sv-badge sv-badge-${inv.status === "Approved" ? "success" : "danger"}`}>
                                {inv.status}
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
        {activeTab === "approvePayments" && (
          <div className="sv-tab-content">
            <h3>Approve Payments</h3>
            <div className="sv-table-container">
              <table className="sv-table sv-table-striped sv-table-rounded">
                <thead>
                  <tr>
                    <th>Invoice Name</th>
                    <th>PO Number</th>
                    <th>Amount</th>
                    <th>Document</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.filter(inv => inv.status === "Approved").length === 0 ? (
                    <tr>
                      <td colSpan={7}>No approved invoices for payment.</td>
                    </tr>
                  ) : (
                    invoices.filter(inv => inv.status === "Approved").map((inv) => (
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
                          <span className="sv-badge sv-badge-success">Approved</span>
                        </td>
                        <td>
                          {(inv.paymentStatus === "Paid") ? (
                            <span className="sv-badge sv-badge-completed">Paid</span>
                          ) : (
                            <button
                              className="sv-btn sv-btn-success"
                              onClick={() => handleApprovePayment(inv.id)}
                            >
                              Mark as Paid
                            </button>
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

        {activeTab === "trackPayments" && (
          <div className="sv-tab-content">
            <h3>Track Payment Records</h3>
            <div className="sv-table-container">
              <table className="sv-table sv-table-striped sv-table-rounded">
                <thead>
                  <tr>
                    <th>Invoice Name</th>
                    <th>PO Number</th>
                    <th>Amount</th>
                    <th>Document</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No invoices found.</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
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
                          {(inv.paymentStatus === "Paid") ? (
                            <span className="sv-badge sv-badge-completed">Paid</span>
                          ) : (
                            <span className="sv-badge sv-badge-warning">Unpaid</span>
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
      </div>
    </div>
    </MainLayout>
  );
}

export default FinanceDashboard;
