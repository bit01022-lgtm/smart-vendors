
import React, { useState, useEffect } from "react";
import MainLayout from '../../components/layout/MainLayout';
import {
  saveVendorRegistration,
  subscribeActivityLogs,
  subscribeAllVendorRegistrations,
} from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';
import '../../styles/DashboardStyles.css';


const initialVendors = [
  { id: "VND-001", name: "Vendor A", email: "vendorA@example.com", status: "Pending" },
  { id: "VND-002", name: "Vendor B", email: "vendorB@example.com", status: "Pending" },
  { id: "VND-003", name: "Vendor C", email: "vendorC@example.com", status: "Approved" },
];


function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("approveVendors");
  const [vendors, setVendors] = useState(initialVendors);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [updatingVendorId, setUpdatingVendorId] = useState(null);

  // Poll persisted activity logs to keep admin monitoring updated.
  useEffect(() => {
    const unsubscribeVendors = subscribeAllVendorRegistrations((items) => {
      setVendors(items.length ? items : initialVendors);
    });
    const unsubscribe = subscribeActivityLogs(setActivityLogs, []);
    return () => {
      unsubscribeVendors();
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
                    <th>Company Name</th>
                    <th>Registration No.</th>
                    <th>Email</th>
                    <th>Documents</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No vendors found.</td>
                    </tr>
                  ) : (
                    vendors.map((v) => (
                      <tr key={getVendorRowId(v)}>
                        <td>{getVendorRowId(v)}</td>
                        <td>{v.companyName || v.name}</td>
                        <td>{v.registrationNumber || '-'}</td>
                        <td>{v.vendorEmail || v.email}</td>
                        <td>
                          {Array.isArray(v.documents) && v.documents.length ? (
                            <div style={{ display: 'grid', gap: 4 }}>
                              {v.documents.map((doc) => (
                                <a key={doc.id} href={doc.fileUrl || '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#1d4ed8' }}>
                                  {doc.name}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#6b7280' }}>No documents</span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              minWidth: 88,
                              textAlign: 'center',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontWeight: 600,
                              fontSize: 12,
                              color:
                                v.status === 'Approved'
                                  ? '#14532d'
                                  : v.status === 'Rejected'
                                  ? '#7f1d1d'
                                  : '#78350f',
                              background:
                                v.status === 'Approved'
                                  ? '#dcfce7'
                                  : v.status === 'Rejected'
                                  ? '#fee2e2'
                                  : '#fef3c7',
                            }}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td>
                          {v.status === "Pending" && (
                            <>
                              <button
                                className="sv-btn sv-btn-success sv-btn-highlight"
                                style={{ marginRight: 8, fontWeight: 'bold', boxShadow: '0 0 6px #28a745', border: '2px solid #28a745' }}
                                onClick={() => handleApprove(getVendorRowId(v))}
                                disabled={updatingVendorId === getVendorRowId(v)}
                              >
                                {updatingVendorId === getVendorRowId(v) ? 'Updating...' : 'Approve'}
                              </button>
                              <button
                                className="sv-btn sv-btn-danger sv-btn-highlight"
                                style={{ fontWeight: 'bold', boxShadow: '0 0 6px #dc3545', border: '2px solid #dc3545' }}
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

