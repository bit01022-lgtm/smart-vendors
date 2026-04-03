
import React, { useEffect, useState } from "react";
import MainLayout from '../../components/layout/MainLayout';
import { saveAllVendorInvoices, subscribeAllVendorInvoices } from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';

import '../../styles/DashboardStyles.css';

function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("viewInvoices");
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeAllVendorInvoices(setInvoices);
    return unsubscribe;
  }, []);

  // Notification logic
  const showNotification = () => {};

  const filteredInvoices = invoices;

  // Payment status logic
  // Persist verification status in invoice object
  const handleVerifyInvoice = (invoiceId, ownerUid, status) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId && inv.ownerUid === ownerUid
        ? { ...inv, status: status === "Verified" ? "Approved" : "Rejected" }
        : inv
    );
    setInvoices(updated);
    saveAllVendorInvoices(updated).catch(() => {});
    logActivity({
      type: 'Invoice Verification',
      reference: invoiceId,
      user: 'Finance User',
      status: status === "Verified" ? 'Approved' : 'Rejected',
    }).catch(() => {});
    showNotification(`Invoice marked as ${status === "Verified" ? "Approved" : "Rejected"}.`);
  };
  // Persist payment status in invoice object
  const handleApprovePayment = (invoiceId, ownerUid) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId && inv.ownerUid === ownerUid ? { ...inv, paymentStatus: "Paid" } : inv
    );
    setInvoices(updated);
    saveAllVendorInvoices(updated).catch(() => {});
    logActivity({
      type: 'Payment Approved',
      reference: invoiceId,
      user: 'Finance User',
      status: 'Paid',
    }).catch(() => {});
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
                                    handleVerifyInvoice(inv.id, inv.ownerUid, "Verified");
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  className="sv-btn sv-btn-danger sv-btn-highlight"
                                  style={{ fontWeight: 'bold', boxShadow: '0 0 6px #dc3545' }}
                                  onClick={() => {
                                    handleVerifyInvoice(inv.id, inv.ownerUid, "Rejected");
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
                            <a href={inv.fileUrl || '#'} target="_blank" rel="noreferrer" title={inv.file} style={{textDecoration:'underline',color:'#007bff'}}>{inv.file}</a>
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
                              onClick={() => handleApprovePayment(inv.id, inv.ownerUid)}
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
                            <a href={inv.fileUrl || '#'} target="_blank" rel="noreferrer" title={inv.file} style={{textDecoration:'underline',color:'#007bff'}}>{inv.file}</a>
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
