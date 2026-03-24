import React, { useState } from "react";

// Demo data to use if localStorage is empty
const demoRequests = [
  {
    id: "REQ-001",
    clientName: "Demo Client",
    title: "Office Supplies",
    description: "Need pens, paper, and staplers for office use.",
    category: "Office Supplies",
    priority: "Medium",
    status: "Pending",
    dateRequired: "2026-03-25",
    dateSubmitted: "2026-03-20",
    details: {
      clientInfo: {
        name: "Demo Client",
        email: "demo@client.com",
        phone: "123-456-7890"
      },
      deadline: "2026-03-25",
      items: ["Pens", "Paper", "Staplers"],
      attachments: []
    }
  },
  {
    id: "REQ-002",
    clientName: "Demo Client",
    title: "Laptop Purchase",
    description: "Requesting 5 new laptops for new hires.",
    category: "Computing Hardware",
    priority: "High",
    status: "Approved",
    dateRequired: "2026-03-28",
    dateSubmitted: "2026-03-21",
    details: {
      clientInfo: {
        name: "Demo Client",
        email: "demo@client.com",
        phone: "123-456-7890"
      },
      deadline: "2026-03-28",
      items: ["5x Laptop"],
      attachments: ["specs.pdf"]
    }
  }
];

// Read from localStorage, fallback to demo data if empty or invalid
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

const ClientRequestsTab = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);

  // Always reload requests from localStorage when the tab is rendered
  React.useEffect(() => {
    setRequests(getClientRequests());
    const handler = () => setRequests(getClientRequests());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="sv-tab-content">
      <h2>Client Requests</h2>
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
                <button className="sv-btn-primary" onClick={() => setSelectedRequest(req)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="sv-modal sv-modal-open">
          <div className="sv-modal-content">
            <h3>Request Details ({selectedRequest.id})</h3>
            <p><strong>Client:</strong> {selectedRequest.details.clientInfo.name} ({selectedRequest.details.clientInfo.email}, {selectedRequest.details.clientInfo.phone})</p>
            <p><strong>Description:</strong> {selectedRequest.description}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            <p><strong>Date Submitted:</strong> {selectedRequest.dateSubmitted}</p>
            <p><strong>Deadline:</strong> {selectedRequest.details.deadline}</p>
            <p><strong>Requested Items/Services:</strong></p>
            <ul>
              {selectedRequest.details.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p><strong>Attachments:</strong> {selectedRequest.details.attachments.length > 0 ? selectedRequest.details.attachments.join(", ") : "None"}</p>
            {selectedRequest.status === "Pending" && (
              <button className="sv-btn-green" style={{marginTop:16}}>
                Create Tender
              </button>
            )}
            <button className="sv-btn-secondary" style={{marginLeft:8}} onClick={() => setSelectedRequest(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientRequestsTab;
