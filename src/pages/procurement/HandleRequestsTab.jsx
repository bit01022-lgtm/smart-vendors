import React, { useState } from "react";

// Demo data to use if localStorage is empty or invalid
const demoRequests = [
  // ...existing demo data...
];

function getClientRequests() {
  const stored = localStorage.getItem('clientRequests');
  if (!stored) return demoRequests;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return demoRequests;
    return parsed;
  } catch {
    return demoRequests;
  }
}

const HandleRequestsTab = () => {
  // const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);

  React.useEffect(() => {
    setRequests(getClientRequests());
    const handler = () => setRequests(getClientRequests());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Handler to update request status
  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => {
      const updated = prev.map(req => req.id === id ? { ...req, status: newStatus } : req);
      localStorage.setItem('clientRequests', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="sv-tab-content">
      <h2>Handle Requests</h2>
      <table className="sv-table sv-table-striped sv-table-rounded">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Client Name</th>
            <th>Title</th>
            <th>Description</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Date Required</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr><td colSpan={9}>No client requests found.</td></tr>
          ) : requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.clientName || "-"}</td>
              <td>{req.title}</td>
              <td>{req.description}</td>
              <td>{req.category}</td>
              <td>{req.priority}</td>
              <td>{req.status}</td>
              <td>{req.dateRequired}</td>
              <td>
                <select
                  value={req.status}
                  onChange={e => handleStatusChange(req.id, e.target.value)}
                >
                  <option value="Pending">Pend</option>
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Reject</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* View Details modal removed as requested */}
    </div>
  );
};

export default HandleRequestsTab;
