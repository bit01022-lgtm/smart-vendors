


import React, { useState } from "react";
import MainLayout from '../../components/layout/MainLayout';

import '../../styles/DashboardStyles.css';

const categoryOptions = {
  "Computing Hardware": ["Laptops", "Desktops", "Servers"],
  "Consumer Electronics": ["Feature Phones", "Smartphones", "Tablets", "Wearables"],
  "Networking Equipment": ["Routers", "Switches", "Access Points"],
  "Peripherals & Accessories": ["Keyboards", "Mice", "Headsets"],
  "Software / Applications": ["Operating Systems", "Productivity", "Security"],
};
const priorityOptions = ["Low", "Medium", "High"];

const preloadedRequests = [
  { id: "REQ-001", title: "Office Supplies", category: "Office Supplies", subcategory: "-", priority: "Medium", budgetMin: "100", budgetMax: "200", dateRequired: "2026-03-25", status: "Pending" },
  { id: "REQ-002", title: "Laptop Purchase", category: "Computing Hardware", subcategory: "Laptops", priority: "High", budgetMin: "800", budgetMax: "1200", dateRequired: "2026-03-28", status: "Approved" },
  { id: "REQ-003", title: "Projector Repair", category: "Consumer Electronics", subcategory: "Projector", priority: "Low", budgetMin: "50", budgetMax: "100", dateRequired: "2026-03-22", status: "Rejected" },
];

function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("submit");
  const [requests, setRequests] = useState(preloadedRequests);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    priority: "Medium",
    budgetMin: "",
    budgetMax: "",
    dateRequired: "",
    attachment: null,
  });
  const [notification, setNotification] = useState("");
  const [editId, setEditId] = useState(null);
  const [editRequest, setEditRequest] = useState({});
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  // Generate next request ID
  const getNextRequestId = () => {
    const num = requests.length + 1;
    return `REQ-${num.toString().padStart(3, "0")}`;
  };

  // Prevent past dates
  const today = new Date().toISOString().split("T")[0];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "category") {
      setForm((prev) => ({
        ...prev,
        category: value,
        subcategory: "",
      }));
    } else if (name === "attachment") {
      setForm((prev) => ({ ...prev, attachment: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: getNextRequestId(),
      title: form.title,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory,
      priority: form.priority,
      budgetMin: form.budgetMin,
      budgetMax: form.budgetMax,
      dateRequired: form.dateRequired,
      attachment: form.attachment,
      status: "Pending",
    };
    setRequests((prev) => [...prev, newRequest]);
    setForm({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      priority: "Medium",
      budgetMin: "",
      budgetMax: "",
      dateRequired: "",
      attachment: null,
    });
    showNotification("Request submitted.");
  };

  // Search and filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Filtered and searched requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      search === "" ||
      req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.category.toLowerCase().includes(search.toLowerCase()) ||
      req.subcategory.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "" || req.status === filterStatus;
    const matchesCategory = filterCategory === "" || req.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <MainLayout title="Client">
      <div className="sv-main-content">
        {notification && (
          <div className={`sv-notification sv-notification-success`}>{notification}</div>
        )}
        <div className="sv-tabs">
          <button
            className={`sv-tab${activeTab === "submit" ? " sv-tab-active" : ""}`}
            onClick={() => setActiveTab("submit")}
          >Submit Request</button>
          <button
            className={`sv-tab${activeTab === "track" ? " sv-tab-active" : ""}`}
            onClick={() => setActiveTab("track")}
          >Track Requests</button>
        </div>
        {activeTab === "submit" ? (
          <div className="sv-tab-content">
            <div className="sv-card sv-form-card">
              <h2 className="sv-card-title">Submit Request</h2>
              <form className="sv-form" onSubmit={handleSubmit}>
                <div className="sv-form-section">
                  <h3 className="sv-section-title">Request Details</h3>
                  <div className="sv-form-group">
                    <label htmlFor="title">Title</label>
                    <input name="title" id="title" type="text" value={form.title} onChange={handleInputChange} required />
                  </div>
                  <div className="sv-form-group">
                    <label htmlFor="description">Description</label>
                    <textarea name="description" id="description" value={form.description} onChange={handleInputChange} required />
                  </div>
                  <div className="sv-form-group">
                    <label htmlFor="category">Category</label>
                    <select name="category" id="category" value={form.category} onChange={handleInputChange} required>
                      <option value="">Select Category</option>
                      {Object.keys(categoryOptions).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sv-form-group">
                    <label htmlFor="subcategory">Subcategory</label>
                    <select name="subcategory" id="subcategory" value={form.subcategory} onChange={handleInputChange} required disabled={!form.category}>
                      <option value="">{form.category ? "Select Subcategory" : "Select Category First"}</option>
                      {form.category && categoryOptions[form.category].map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sv-form-group">
                    <label htmlFor="priority">Priority</label>
                    <select name="priority" id="priority" value={form.priority} onChange={handleInputChange} required>
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="sv-form-section">
                  <h3 className="sv-section-title">Budget</h3>
                  <div className="sv-form-group">
                    <label htmlFor="budgetMin">Budget Min</label>
                    <input name="budgetMin" id="budgetMin" type="number" value={form.budgetMin} onChange={handleInputChange} min="0" required />
                  </div>
                  <div className="sv-form-group">
                    <label htmlFor="budgetMax">Budget Max</label>
                    <input name="budgetMax" id="budgetMax" type="number" value={form.budgetMax} onChange={handleInputChange} min={form.budgetMin || 0} required />
                  </div>
                  <div className="sv-form-group">
                    <label htmlFor="dateRequired">Date Required</label>
                    <input name="dateRequired" id="dateRequired" type="date" value={form.dateRequired} onChange={handleInputChange} min={today} required />
                  </div>
                  <div className="sv-form-group">
                    <label htmlFor="attachment">Attachments</label>
                    <input name="attachment" id="attachment" type="file" onChange={handleInputChange} />
                  </div>
                </div>
                <button type="submit" className="sv-btn-primary">Submit</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="sv-tab-content">
            <div style={{ marginBottom: 10 }}>
              <input
                placeholder="Search by ID, Title, Category, Subcategory"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: 220, marginRight: 8 }}
              />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ marginRight: 8 }}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ marginRight: 8 }}>
                <option value="">All Categories</option>
                {Object.keys(categoryOptions).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterCategory(""); }} type="button">Clear</button>
            </div>
            <div className="sv-table-container">
              <table className="sv-table sv-table-striped sv-table-rounded">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Priority</th>
                    <th>Budget</th>
                    <th>Date Required</th>
                    <th>Status</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={10}>No requests found.</td>
                    </tr>
                  ) : (
                    filteredRequests.map((req, idx) => (
                      <tr key={req.id} className={idx % 2 === 1 ? 'sv-table-row-alt' : ''}>
                        <td>{req.id}</td>
                        <td>
                          {editId === req.id ? (
                            <input
                              name="title"
                              value={editRequest.title}
                              onChange={e => setEditRequest({ ...editRequest, title: e.target.value })}
                            />
                          ) : (
                            req.title
                          )}
                        </td>
                        <td>{req.category}</td>
                        <td>{req.subcategory}</td>
                        <td>{req.priority}</td>
                        <td>{req.budgetMin} - {req.budgetMax}</td>
                        <td>{req.dateRequired}</td>
                        <td>
                          <span className={`sv-badge sv-badge-${req.status.toLowerCase()}`}>{req.status}</span>
                        </td>
                        <td>
                          {editId === req.id ? (
                            <>
                              <button onClick={() => {
                                setRequests(prev => prev.map(r => r.id === req.id ? { ...r, title: editRequest.title } : r));
                                setEditId(null);
                                setEditRequest({});
                                showNotification("Request updated.");
                              }}>Save</button>
                              <button onClick={() => { setEditId(null); setEditRequest({}); }}>Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => { setEditId(req.id); setEditRequest({ ...req }); }}>Edit</button>
                          )}
                        </td>
                        <td>
                          <button onClick={() => {
                            setRequests(prev => prev.filter(r => r.id !== req.id));
                            showNotification("Request deleted.");
                          }}>Delete</button>
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
    </MainLayout>
  );
}

export default ClientDashboard;
