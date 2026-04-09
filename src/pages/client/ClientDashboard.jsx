
import React, { useEffect, useState } from "react";
import MainLayout from '../../components/layout/MainLayout';
import {
  saveClientRequests,
  subscribeClientRequests,
  uploadFiles,
} from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';
import { useAuth } from '../../context/useAuth';

 

const categoryOptions = {
  "Computing Hardware": ["Laptops", "Desktops", "Servers"],
  "Consumer Electronics": ["Feature Phones", "Smartphones", "Tablets", "Wearables"],
  "Networking Equipment": ["Routers", "Switches", "Access Points"],
  "Peripherals & Accessories": ["Keyboards", "Mice", "Headsets"],
  "Software / Applications": ["Operating Systems", "Productivity", "Security"],
};
const priorityOptions = ["Low", "Medium", "High"];

const preloadedRequests = [];

function ClientDashboard() {
  const { currentUser, profile } = useAuth();
  const clientDisplayName = profile?.name || currentUser?.name || currentUser?.email || 'Demo Client';

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

  useEffect(() => {
    const unsubscribe = subscribeClientRequests(setRequests, preloadedRequests);
    return unsubscribe;
  }, []);

  // Generate next request ID
  const getNextRequestId = () => `REQ-${Date.now()}`;

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
  const handleSubmit = async (e) => {
    e.preventDefault();

    let attachmentMeta = null;
    if (form.attachment) {
      try {
        const [uploaded] = await uploadFiles([form.attachment]);
        attachmentMeta = uploaded
          ? {
            name: uploaded.originalName,
            fileName: uploaded.fileName,
            fileUrl: uploaded.fileUrl,
            size: uploaded.size,
            type: uploaded.contentType,
            uploadedAt: uploaded.uploadedAt,
          }
          : null;
      } catch {
        showNotification('Unable to upload attachment. Please try again.');
        return;
      }
    }

    const newRequest = {
      id: getNextRequestId(),
      clientName: clientDisplayName,
      title: form.title,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory,
      priority: form.priority,
      budgetMin: form.budgetMin,
      budgetMax: form.budgetMax,
      dateRequired: form.dateRequired,
      attachment: attachmentMeta,
      status: "Pending",
      source: "v2",
      createdAt: new Date().toISOString(),
    };

    const updatedRequests = [...requests, newRequest];
    setRequests(updatedRequests);
    try {
      await saveClientRequests(updatedRequests);
    } catch {
      setRequests(requests);
      showNotification("Failed to save request. Please try again.");
      return;
    }

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
    logActivity({
      type: 'Client Request Submitted',
      reference: newRequest.id,
      user: clientDisplayName,
      status: newRequest.status,
    }).catch(() => {});
    showNotification("Request submitted.");
  };

  // Search and filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const tabBase = 'rounded-lg px-4 py-2 text-sm font-semibold transition';
  const tabActive = 'bg-slate-900 text-white shadow';
  const tabInactive = 'bg-white text-slate-600 hover:bg-slate-100';
  const cardClass = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm';
  const formClass = 'grid gap-4';
  const formGroupClass = 'grid gap-2';
  const labelClass = 'text-sm font-medium text-slate-700';
  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100';
  const selectClass = inputClass;
  const textareaClass = `${inputClass} min-h-[120px]`;
  const buttonPrimary = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700';
  const buttonGhost = 'rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100';
  const badgeClass = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
  };
  const tableWrap = 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm';
  const tableClass = 'min-w-full text-sm';
  const thClass = 'bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
  const tdClass = 'border-t border-slate-100 px-4 py-3 text-slate-700';

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
      <div className="space-y-6">
        {notification && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {notification}
          </div>
        )}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            className={`${tabBase} ${activeTab === 'submit' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("submit")}
          >Submit Request</button>
          <button
            className={`${tabBase} ${activeTab === 'track' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("track")}
          >Track Requests</button>
        </div>
        {activeTab === "submit" ? (
          <div className="space-y-6">
            <div className={cardClass}>
              <h2 className="mb-5 text-xl font-semibold text-slate-900">Submit Request</h2>
              <form className={formClass} onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">Request Details</h3>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="clientName">Client Name</label>
                    <input
                      name="clientName"
                      id="clientName"
                      type="text"
                      value={clientDisplayName}
                      disabled
                      readOnly
                      className={`${inputClass} bg-slate-100 text-slate-500`}
                    />
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="title">Title</label>
                    <input className={inputClass} name="title" id="title" type="text" value={form.title} onChange={handleInputChange} required />
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="description">Description</label>
                    <textarea className={textareaClass} name="description" id="description" value={form.description} onChange={handleInputChange} required />
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="category">Category</label>
                    <select className={selectClass} name="category" id="category" value={form.category} onChange={handleInputChange} required>
                      <option value="">Select Category</option>
                      {Object.keys(categoryOptions).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="subcategory">Subcategory</label>
                    <select className={selectClass} name="subcategory" id="subcategory" value={form.subcategory} onChange={handleInputChange} required disabled={!form.category}>
                      <option value="">{form.category ? "Select Subcategory" : "Select Category First"}</option>
                      {form.category && categoryOptions[form.category].map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="priority">Priority</label>
                    <select className={selectClass} name="priority" id="priority" value={form.priority} onChange={handleInputChange} required>
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">Budget</h3>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="budgetMin">Budget Min</label>
                    <input className={inputClass} name="budgetMin" id="budgetMin" type="number" value={form.budgetMin} onChange={handleInputChange} min="0" required />
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="budgetMax">Budget Max</label>
                    <input className={inputClass} name="budgetMax" id="budgetMax" type="number" value={form.budgetMax} onChange={handleInputChange} min={form.budgetMin || 0} required />
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="dateRequired">Date Required</label>
                    <input className={inputClass} name="dateRequired" id="dateRequired" type="date" value={form.dateRequired} onChange={handleInputChange} min={today} required />
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass} htmlFor="attachment">Attachments (specifications)</label>
                    <input className="text-sm text-slate-600" name="attachment" id="attachment" type="file" onChange={handleInputChange} />
                  </div>
                </div>
                <button type="submit" className={buttonPrimary}>Submit</button>
              </form>
            </div>
          </div>
        ) : activeTab === "track" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Search by ID, Title, Category, Subcategory"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`${inputClass} max-w-xs`}
              />
              <select className={selectClass} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select className={selectClass} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                {Object.keys(categoryOptions).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                className={buttonGhost}
                onClick={() => { setSearch(""); setFilterStatus(""); setFilterCategory(""); }}
                type="button"
              >
                Clear
              </button>
            </div>
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Request ID</th>
                    <th className={thClass}>Title</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Subcategory</th>
                    <th className={thClass}>Priority</th>
                    <th className={thClass}>Budget</th>
                    <th className={thClass}>Date Required</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Edit</th>
                    <th className={thClass}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td className={`${tdClass} text-center`} colSpan={10}>No requests found.</td>
                    </tr>
                  ) : (
                    filteredRequests.map((req, idx) => (
                      <tr key={req.id} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                        <td className={tdClass}>{req.id}</td>
                        <td className={tdClass}>
                          {editId === req.id ? (
                            <input
                              className={inputClass}
                              name="title"
                              value={editRequest.title}
                              onChange={e => setEditRequest({ ...editRequest, title: e.target.value })}
                            />
                          ) : (
                            req.title
                          )}
                        </td>
                        <td className={tdClass}>{req.category}</td>
                        <td className={tdClass}>{req.subcategory}</td>
                        <td className={tdClass}>{req.priority}</td>
                        <td className={tdClass}>{req.budgetMin} - {req.budgetMax}</td>
                        <td className={tdClass}>{req.dateRequired}</td>
                        <td className={tdClass}>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[req.status] || 'bg-slate-100 text-slate-700'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className={tdClass}>
                          {editId === req.id ? (
                            <>
                              <button className={buttonPrimary} onClick={async () => {
                                const updatedRequests = requests.map((r) =>
                                  r.id === req.id ? { ...r, title: editRequest.title } : r
                                );

                                setRequests(updatedRequests);
                                try {
                                  await saveClientRequests(updatedRequests);
                                } catch {
                                  setRequests(requests);
                                  showNotification("Failed to update request.");
                                  return;
                                }

                                setEditId(null);
                                setEditRequest({});
                                logActivity({
                                  type: 'Client Request Updated',
                                  reference: req.id,
                                  user: req.clientName || 'Client User',
                                  status: req.status || 'Pending',
                                }).catch(() => {});
                                showNotification("Request updated.");
                              }}>Save</button>
                              <button className={buttonGhost} onClick={() => { setEditId(null); setEditRequest({}); }}>Cancel</button>
                            </>
                          ) : (
                            <button className={buttonGhost} onClick={() => { setEditId(req.id); setEditRequest({ ...req }); }}>Edit</button>
                          )}
                        </td>
                        <td className={tdClass}>
                          <button className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50" onClick={async () => {
                            const updatedRequests = requests.filter((r) => r.id !== req.id);

                            setRequests(updatedRequests);
                            try {
                              await saveClientRequests(updatedRequests);
                            } catch {
                              setRequests(requests);
                              showNotification("Failed to delete request.");
                              return;
                            }

                            logActivity({
                              type: 'Client Request Deleted',
                              reference: req.id,
                              user: req.clientName || 'Client User',
                              status: req.status || 'Pending',
                            }).catch(() => {});
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
        ) : null}
      </div>
    </MainLayout>
  );
}

export default ClientDashboard;
