import React, { useState } from "react";
import {
  saveClientRequests,
  subscribeClientRequests,
} from '../../services/dataService';

const demoRequests = [];

const HandleRequestsTab = () => {
  // const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);

  React.useEffect(() => {
    const unsubscribe = subscribeClientRequests(setRequests, demoRequests);
    return unsubscribe;
  }, []);

  // Handler to update request status
  const handleStatusChange = async (id, newStatus) => {
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status: newStatus } : req
    );

    setRequests(updated);

    try {
      await saveClientRequests(updated);
    } catch {
      setRequests(requests);
    }
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
            <th>Budget</th>
            <th>Status</th>
            <th>Date Required</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr><td colSpan={10}>No client requests found.</td></tr>
          ) : requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.clientName || "-"}</td>
              <td>{req.title}</td>
              <td>{req.description}</td>
              <td>{req.category}</td>
              <td>{req.priority}</td>
              <td>
                {req.budgetMin || req.budgetMax
                  ? `${req.budgetMin || '-'} - ${req.budgetMax || '-'}`
                  : 'Not provided'}
              </td>
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
