
import React, { useState } from "react";
import MainLayout from '../../components/layout/MainLayout';
import '../../styles/DashboardStyles.css';

const initialInvoices = [
  { id: "INV-001", poNumber: "PO-001", vendorName: "Vendor A", amount: 65000, submissionDate: "2026-03-25", status: "Submitted" },
  { id: "INV-002", poNumber: "PO-002", vendorName: "Vendor B", amount: 45000, submissionDate: "2026-03-26", status: "Submitted" }
];

function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("viewInvoices");
  const [invoices, setInvoices] = useState(initialInvoices);
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

  return (
    <MainLayout title="Finance">
      <div className="sv-main-content">
        <div className="sv-tabs">
          <button className={`sv-tab${activeTab === "viewInvoices" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("viewInvoices")}>View Invoices</button>
          <button className={`sv-tab${activeTab === "approvePayments" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("approvePayments")}>Approve Payments</button>
          <button className={`sv-tab${activeTab === "trackPayments" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("trackPayments")}>Track Payment Records</button>
          <button className={`sv-tab${activeTab === "vendor" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("vendor")}>Vendor</button>
        </div>
        <div>
          {notifications.map((msg, idx) => (
            <div className="sv-notification sv-notification-success" key={idx}>{msg}</div>
          ))}
        </div>
        {activeTab === "viewInvoices" && (
          <div className="sv-tab-content">
            <h3>Invoices</h3>
            <div className="dashboard-filters">
              <input
                name="vendor"
                placeholder="Filter by Vendor"
                value={filters.vendor}
                onChange={handleFilterChange}
              />
              <input
                name="poNumber"
                placeholder="Filter by PO Number"
                value={filters.poNumber}
                onChange={handleFilterChange}
              />
              <input
                name="status"
                placeholder="Filter by Status"
                value={filters.status}
                onChange={handleFilterChange}
              />
              <input
                name="amount"
                placeholder="Filter by Amount"
                value={filters.amount}
                onChange={handleFilterChange}
              />
            </div>
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>PO Number</th>
                  <th>Vendor Name</th>
                  <th>Amount</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                      <td>{inv.id}</td>
                      <td>
                        {editId === inv.id ? (
                          <input
                            name="poNumber"
                            value={editInvoice.poNumber}
                            onChange={handleEditChange}
                          />
                        ) : (
                          inv.poNumber
                        )}
                      </td>
                      <td>
                        {editId === inv.id ? (
                          <input
                            name="vendorName"
                            value={editInvoice.vendorName}
                            onChange={handleEditChange}
                          />
                        ) : (
                          inv.vendorName
                        )}
                      </td>
                      <td>
                        {editId === inv.id ? (
                          <input
                            name="amount"
                            type="number"
                            value={editInvoice.amount}
                            onChange={handleEditChange}
                          />
                        ) : (
                          inv.amount
                        )}
                      </td>
                      <td>
                        {editId === inv.id ? (
                          <input
                            name="submissionDate"
                            type="date"
                            value={editInvoice.submissionDate}
                            onChange={handleEditChange}
                          />
                        ) : (
                          inv.submissionDate
                        )}
                      </td>
                      <td>
                        {editId === inv.id ? (
                          <input
                            name="status"
                            value={editInvoice.status}
                            onChange={handleEditChange}
                          />
                        ) : (
                          inv.status
                        )}
                      </td>
                      <td>
                        {editId === inv.id ? (
                          <>
                            <button onClick={handleEditSave}>Save</button>
                            <button onClick={handleEditCancel}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(inv)}>Edit</button>
                            <button onClick={() => handleDelete(inv.id)}>Delete</button>
                            <button onClick={() => handleDownload(inv.id)}>Download</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Approve Payments and Track Payment Records tabs intentionally left out for this request */}
        {activeTab === "vendor" && (
          <div className="sv-tab-content">
            <h3>Vendor Tab</h3>
            <p>This is a placeholder for the Vendor tab. Add vendor-related finance features here.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default FinanceDashboard;
