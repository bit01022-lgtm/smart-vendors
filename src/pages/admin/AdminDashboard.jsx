
import React, { useState, useEffect } from "react";
import MainLayout from '../../components/layout/MainLayout';
import {
  saveVendorRegistration,
  subscribeActivityLogs,
  subscribeAllVendorInvoices,
  subscribeAllVendorRegistrations,
  subscribeProcurementTenders,
} from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';
 

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("approveVendors");
  const [vendors, setVendors] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [updatingVendorId, setUpdatingVendorId] = useState(null);

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
  };
  const actionButton = 'rounded-lg px-3 py-2 text-sm font-semibold text-white transition';

  // Poll persisted activity logs to keep admin monitoring updated.
  useEffect(() => {
    const unsubscribeVendors = subscribeAllVendorRegistrations((items) => {
      setVendors(items);
    });
    const unsubscribeTenders = subscribeProcurementTenders(setTenders, []);
    const unsubscribeInvoices = subscribeAllVendorInvoices(setAllInvoices);
    const unsubscribe = subscribeActivityLogs(setActivityLogs, []);
    return () => {
      unsubscribeVendors();
      unsubscribeTenders();
      unsubscribeInvoices();
      unsubscribe();
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
  const getVendorRowId = (vendor) => vendor.id || vendor.ownerUid;

  const handleApprove = async (id) => {
    setUpdatingVendorId(id);
    const nextVendors = vendors.map((v) =>
      getVendorRowId(v) === id ? { ...v, status: 'Approved' } : v
    );
    setVendors(nextVendors);

    const targetVendor = nextVendors.find((vendor) => getVendorRowId(vendor) === id);
    try {
      if (targetVendor?.ownerUid) {
        await saveVendorRegistration(targetVendor.ownerUid, targetVendor);
      }
      logActivity({
        type: 'Vendor Registration Approved',
        reference: id,
        user: 'Admin User',
        status: 'Approved',
      }).catch(() => {});
      showNotification(`Vendor ${id} approved.`);
    } catch {
      showNotification(`Failed to approve vendor ${id}.`);
    } finally {
      setUpdatingVendorId(null);
    }
  };
  const handleReject = async (id) => {
    setUpdatingVendorId(id);
    const nextVendors = vendors.map((v) =>
      getVendorRowId(v) === id ? { ...v, status: 'Rejected' } : v
    );
    setVendors(nextVendors);

    const targetVendor = nextVendors.find((vendor) => getVendorRowId(vendor) === id);
    try {
      if (targetVendor?.ownerUid) {
        await saveVendorRegistration(targetVendor.ownerUid, targetVendor);
      }
      logActivity({
        type: 'Vendor Registration Rejected',
        reference: id,
        user: 'Admin User',
        status: 'Rejected',
      }).catch(() => {});
      showNotification(`Vendor ${id} rejected.`);
    } catch {
      showNotification(`Failed to reject vendor ${id}.`);
    } finally {
      setUpdatingVendorId(null);
    }
  };

  const totalUsers = vendors.length;
  const totalTenders = tenders.length;
  const totalPayments = allInvoices.filter((invoice) => invoice.paymentStatus === 'Paid').length;

  return (
    <MainLayout title="Admin">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 px-6 py-5 text-white shadow-lg shadow-blue-200/50">
            <div className="text-sm uppercase tracking-wide text-blue-50/90">Total Users</div>
            <div className="mt-2 text-3xl font-semibold">{totalUsers}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-300 to-amber-200 px-6 py-5 text-amber-900 shadow-lg shadow-amber-200/50">
            <div className="text-sm uppercase tracking-wide text-amber-800/80">Total Tenders</div>
            <div className="mt-2 text-3xl font-semibold">{totalTenders}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 px-6 py-5 text-white shadow-lg shadow-emerald-200/50">
            <div className="text-sm uppercase tracking-wide text-emerald-50/90">Total Payments</div>
            <div className="mt-2 text-3xl font-semibold">{totalPayments}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            className={`${tabBase} ${activeTab === 'approveVendors' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("approveVendors")}
          >
            Approve Vendors
          </button>
          <button
            className={`${tabBase} ${activeTab === 'monitorActivity' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("monitorActivity")}
          >
            Monitor Procurement Activity
          </button>
        </div>
        <div>
          {notifications.map((msg, idx) => (
            <div key={idx} className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {msg}
            </div>
          ))}
        </div>
        {activeTab === "approveVendors" && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Approve Vendors</h3>
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Vendor ID</th>
                    <th className={thClass}>Company Name</th>
                    <th className={thClass}>Registration No.</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Documents</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr>
                      <td className={`${tdClass} text-center`} colSpan={7}>No vendors found.</td>
                    </tr>
                  ) : (
                    vendors.map((v) => (
                      <tr key={getVendorRowId(v)}>
                        <td className={tdClass}>{getVendorRowId(v)}</td>
                        <td className={tdClass}>{v.companyName || v.name}</td>
                        <td className={tdClass}>{v.registrationNumber || '-'}</td>
                        <td className={tdClass}>{v.vendorEmail || v.email}</td>
                        <td className={tdClass}>
                          {Array.isArray(v.documents) && v.documents.length ? (
                            <div className="grid gap-1">
                              {v.documents.map((doc) => (
                                <a key={doc.id} href={doc.fileUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                  {doc.name}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500">No documents</span>
                          )}
                        </td>
                        <td className={tdClass}>
                          <span
                            className={`inline-flex min-w-[88px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass[v.status] || badgeClass.Pending}`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className={tdClass}>
                          {v.status === "Pending" && (
                            <>
                              <button
                                className={`${actionButton} mr-2 bg-emerald-600 hover:bg-emerald-700`}
                                onClick={() => handleApprove(getVendorRowId(v))}
                                disabled={updatingVendorId === getVendorRowId(v)}
                              >
                                {updatingVendorId === getVendorRowId(v) ? 'Updating...' : 'Approve'}
                              </button>
                              <button
                                className={`${actionButton} bg-rose-600 hover:bg-rose-700`}
                                onClick={() => handleReject(getVendorRowId(v))}
                                disabled={updatingVendorId === getVendorRowId(v)}
                              >
                                {updatingVendorId === getVendorRowId(v) ? 'Updating...' : 'Reject'}
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
            <h3 className="text-lg font-semibold text-slate-900">Procurement Activity Logs</h3>
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Activity ID</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Reference</th>
                    <th className={thClass}>User</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td className={`${tdClass} text-center`} colSpan={6}>No activity logs found.</td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td className={tdClass}>{log.id}</td>
                        <td className={tdClass}>{log.type}</td>
                        <td className={tdClass}>{log.reference}</td>
                        <td className={tdClass}>{log.user}</td>
                        <td className={tdClass}>{log.date}</td>
                        <td className={tdClass}>{log.status}</td>
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

