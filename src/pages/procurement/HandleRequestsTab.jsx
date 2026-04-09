import React, { useState } from "react";
import {
  saveClientRequests,
  subscribeClientRequests,
} from '../../services/dataService';

const demoRequests = [];

const HandleRequestsTab = () => {
  // const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);

  const tableWrap = 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm';
  const tableClass = 'min-w-full text-sm';
  const thClass = 'bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
  const tdClass = 'border-t border-slate-100 px-4 py-3 text-slate-700';
  const selectClass = 'rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';

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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Handle Requests</h2>

      <div className={tableWrap}>
        <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>Request ID</th>
            <th className={thClass}>Client Name</th>
            <th className={thClass}>Title</th>
            <th className={thClass}>Description</th>
            <th className={thClass}>Category</th>
            <th className={thClass}>Priority</th>
            <th className={thClass}>Budget</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Date Required</th>
            <th className={thClass}>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr><td className={`${tdClass} text-center`} colSpan={10}>No client requests found.</td></tr>
          ) : requests.map((req) => (
            <tr key={req.id}>
              <td className={tdClass}>{req.id}</td>
              <td className={tdClass}>{req.clientName || "-"}</td>
              <td className={tdClass}>{req.title}</td>
              <td className={tdClass}>{req.description}</td>
              <td className={tdClass}>{req.category}</td>
              <td className={tdClass}>{req.priority}</td>
              <td className={tdClass}>
                {req.budgetMin || req.budgetMax
                  ? `${req.budgetMin || '-'} - ${req.budgetMax || '-'}`
                  : 'Not provided'}
              </td>
              <td className={tdClass}>{req.status}</td>
              <td className={tdClass}>{req.dateRequired}</td>
              <td className={tdClass}>
                <select
                  className={selectClass}
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
      </div>
      {/* View Details modal removed as requested */}
    </div>
  );
};

export default HandleRequestsTab;
