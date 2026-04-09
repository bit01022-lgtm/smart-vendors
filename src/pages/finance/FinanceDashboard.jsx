
import React, { useEffect, useState } from "react";
import MainLayout from '../../components/layout/MainLayout';
import { saveAllVendorInvoices, subscribeAllVendorInvoices } from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';

 

function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("viewInvoices");
  const [invoices, setInvoices] = useState([]);

  const tabBase = 'rounded-lg px-4 py-2 text-sm font-semibold transition';
  const tabActive = 'bg-slate-900 text-white shadow';
  const tabInactive = 'bg-white text-slate-600 hover:bg-slate-100';
  const tableWrap = 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm';
  const tableClass = 'min-w-full text-sm';
  const thClass = 'bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
  const tdClass = 'border-t border-slate-100 px-4 py-3 text-slate-700';
  const badgeClass = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
    Pending: 'bg-amber-100 text-amber-700',
    Paid: 'bg-emerald-100 text-emerald-700',
    Unpaid: 'bg-amber-100 text-amber-700',
  };

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
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 px-6 py-5 text-white shadow-lg shadow-blue-200/50">
            <div className="text-sm uppercase tracking-wide text-blue-50/90">Total Payments</div>
            <div className="mt-2 text-3xl font-semibold">{totalPayments}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-300 to-amber-200 px-6 py-5 text-amber-900 shadow-lg shadow-amber-200/50">
            <div className="text-sm uppercase tracking-wide text-amber-800/80">Pending</div>
            <div className="mt-2 text-3xl font-semibold">{pendingPayments}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 px-6 py-5 text-white shadow-lg shadow-emerald-200/50">
            <div className="text-sm uppercase tracking-wide text-emerald-50/90">Completed</div>
            <div className="mt-2 text-3xl font-semibold">{completedPayments}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button className={`${tabBase} ${activeTab === 'viewInvoices' ? tabActive : tabInactive}`} onClick={() => setActiveTab("viewInvoices")}>Handle Invoices</button>
          <button className={`${tabBase} ${activeTab === 'approvePayments' ? tabActive : tabInactive}`} onClick={() => setActiveTab("approvePayments")}>Approve Payments</button>
          <button className={`${tabBase} ${activeTab === 'trackPayments' ? tabActive : tabInactive}`} onClick={() => setActiveTab("trackPayments")}>Track Payment Records</button>
        </div>
        <div>
          {activeTab === "viewInvoices" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Handle Invoices</h3>
              <div className={tableWrap}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Invoice Name</th>
                      <th className={thClass}>PO Number</th>
                      <th className={thClass}>Amount</th>
                      <th className={thClass}>Document</th>
                      <th className={thClass}>Submission Date</th>
                      <th className={thClass}>Verification</th>
                      <th className={thClass}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td className={`${tdClass} text-center`} colSpan={7}>No invoices found.</td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className={tdClass}>{inv.name || inv.file || inv.id}</td>
                          <td className={tdClass}>{inv.po || inv.poNumber}</td>
                          <td className={tdClass}>{inv.amount || '-'}</td>
                          <td className={tdClass}>
                            {inv.file ? (
                              <a href={"#"} title={inv.file} className="text-blue-600 underline">{inv.file}</a>
                            ) : (
                              <span className="text-slate-500">No file</span>
                            )}
                          </td>
                          <td className={tdClass}>{inv.submissionDate}</td>
                          <td className={tdClass}>
                            {(inv.status === "Approved" || inv.status === "Rejected") ? (
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[inv.status]}`}>
                                {inv.status}
                              </span>
                            ) : (
                              <>
                                <button
                                  className="mr-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                  onClick={() => {
                                    handleVerifyInvoice(inv.id, inv.ownerUid, "Verified");
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                                  onClick={() => {
                                    handleVerifyInvoice(inv.id, inv.ownerUid, "Rejected");
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                          <td className={tdClass}>
                            {(inv.status === "Approved" || inv.status === "Rejected") ? (
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[inv.status]}`}>
                                {inv.status}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass.Pending}`}>Pending</span>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Approve Payments</h3>
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Invoice Name</th>
                    <th className={thClass}>PO Number</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Document</th>
                    <th className={thClass}>Submission Date</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.filter(inv => inv.status === "Approved").length === 0 ? (
                    <tr>
                      <td className={`${tdClass} text-center`} colSpan={7}>No approved invoices for payment.</td>
                    </tr>
                  ) : (
                    invoices.filter(inv => inv.status === "Approved").map((inv) => (
                      <tr key={inv.id}>
                        <td className={tdClass}>{inv.name || inv.file || inv.id}</td>
                        <td className={tdClass}>{inv.po || inv.poNumber}</td>
                        <td className={tdClass}>{inv.amount || '-'}</td>
                        <td className={tdClass}>
                          {inv.file ? (
                            <a href={inv.fileUrl || '#'} target="_blank" rel="noreferrer" title={inv.file} className="text-blue-600 underline">{inv.file}</a>
                          ) : (
                            <span className="text-slate-500">No file</span>
                          )}
                        </td>
                        <td className={tdClass}>{inv.submissionDate}</td>
                        <td className={tdClass}>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass.Approved}`}>Approved</span>
                        </td>
                        <td className={tdClass}>
                          {(inv.paymentStatus === "Paid") ? (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass.Paid}`}>Paid</span>
                          ) : (
                            <button
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Track Payment Records</h3>
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Invoice Name</th>
                    <th className={thClass}>PO Number</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Document</th>
                    <th className={thClass}>Submission Date</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td className={`${tdClass} text-center`} colSpan={6}>No invoices found.</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className={tdClass}>{inv.name || inv.file || inv.id}</td>
                        <td className={tdClass}>{inv.po || inv.poNumber}</td>
                        <td className={tdClass}>{inv.amount || '-'}</td>
                        <td className={tdClass}>
                          {inv.file ? (
                            <a href={inv.fileUrl || '#'} target="_blank" rel="noreferrer" title={inv.file} className="text-blue-600 underline">{inv.file}</a>
                          ) : (
                            <span className="text-slate-500">No file</span>
                          )}
                        </td>
                        <td className={tdClass}>{inv.submissionDate}</td>
                        <td className={tdClass}>
                          {(inv.paymentStatus === "Paid") ? (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass.Paid}`}>Paid</span>
                          ) : (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass.Unpaid}`}>Unpaid</span>
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
