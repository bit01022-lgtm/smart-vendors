

import React, { useState } from "react";

import MainLayout from '../../components/layout/MainLayout';
import HandleRequestsTab from './HandleRequestsTab';

import '../../styles/DashboardStyles.css';

  // ...existing code...

const categoryOptions = {
  "Computing Hardware": ["Laptops", "Desktops", "Servers"],
  "Consumer Electronics": ["Feature Phones", "Smartphones", "Tablets", "Wearables", "Projectors"],
  "Networking Equipment": ["Routers", "Switches", "Access Points"],
  "Peripherals & Accessories": ["Keyboards", "Mice", "Headsets"],
  "Software / Applications": ["Operating Systems", "Productivity", "Security"],
};

const initialTenders = [
  {
    id: "TND-001",
    title: "Laptop Procurement",
    category: "Computing Hardware",
    subcategory: "Laptops",
    budget: { min: 50000, max: 70000 },
    deadline: "2026-04-10",
    status: "Open",
    attachments: [],
  },
  {
    id: "TND-002",
    title: "Projector Procurement",
    category: "Consumer Electronics",
    subcategory: "Projectors",
    budget: { min: 15000, max: 25000 },
    deadline: "2026-04-15",
    status: "Open",
    attachments: [],
  },
];

const initialBids = [
  {
    id: "BID-001",
    tenderId: "TND-001",
    vendor: "Vendor A",
    amount: 60000,
    date: "2026-03-20",
    status: "Pending",
  },
  {
    id: "BID-002",
    tenderId: "TND-001",
    vendor: "Vendor B",
    amount: 59000,
    date: "2026-03-21",
    status: "Pending",
  },
  {
    id: "BID-003",
    tenderId: "TND-002",
    vendor: "Vendor C",
    amount: 20000,
    date: "2026-03-21",
    status: "Pending",
  },
];

function ProcurementDashboard() {
      // Helper functions
      function getNextTenderId() {
        const num = tenders.length + 1;
        return `TND-${num.toString().padStart(3, "0")}`;
      }
      function getNextPoNumber() {
        return `PO-${(purchaseOrders.length + 1).toString().padStart(3, "0")}`;
      }
      function handleInputChange(e) {
        const { name, value, files } = e.target;
        if (name === "category") {
          setForm((prev) => ({ ...prev, category: value, subcategory: "" }));
        } else if (name === "attachments") {
          setForm((prev) => ({ ...prev, attachments: files ? Array.from(files) : [] }));
        } else {
          setForm((prev) => ({ ...prev, [name]: value }));
        }
      }
      function handleSubmit(e) {
        e.preventDefault();
        const newTender = {
          id: getNextTenderId(),
          title: form.title,
          category: form.category,
          subcategory: form.subcategory,
          budget: { min: Number(form.budgetMin), max: Number(form.budgetMax) },
          deadline: form.deadline,
          status: "Open",
          attachments: form.attachments,
        };
        setTenders((prev) => [...prev, newTender]);
        setForm({
          title: "",
          description: "",
          category: "",
          subcategory: "",
          budgetMin: "",
          budgetMax: "",
          deadline: "",
          attachments: [],
        });
        showNotification("Tender created.");
      }
      function handleSelectWinnerTender(e) {
        setWinnerTenderId(e.target.value);
        setSelectedBidId("");
      }
      function handleSelectWinner(bidId) {
        setBids((prev) => {
          const tenderId = winnerTenderId;
          return prev.map((bid) =>
            bid.tenderId === tenderId
              ? { ...bid, status: bid.id === bidId ? "Winner" : "Rejected" }
              : bid
          );
        });
        showNotification("Winner selected.");
      }
      function handlePoTenderChange(e) {
        const tenderId = e.target.value;
        setPoForm((prev) => ({ ...prev, tenderId, vendor: "", amount: "" }));
      }
      function handlePoVendorChange(e) {
        const vendor = e.target.value;
        const bid = bids.find(
          (b) => b.tenderId === poForm.tenderId && b.vendor === vendor && b.status === "Winner"
        );
        setPoForm((prev) => ({
          ...prev,
          vendor,
          amount: bid ? bid.amount : "",
          poNumber: getNextPoNumber(),
        }));
      }
      function handlePoInputChange(e) {
        const { name, value } = e.target;
        setPoForm((prev) => ({ ...prev, [name]: value }));
      }
      function handlePoSubmit(e) {
        e.preventDefault();
        setPurchaseOrders((prev) => [
          ...prev,
          {
            ...poForm,
            poNumber: getNextPoNumber(),
          },
        ]);
        setTenders((prev) =>
          prev.map((t) =>
            t.id === poForm.tenderId ? { ...t, status: "Closed" } : t
          )
        );
        setPoForm({
          tenderId: "",
          vendor: "",
          poNumber: "",
          issueDate: today,
          amount: "",
          notes: "",
        });
        showNotification("Purchase order issued.");
      }
    // State for tenders, bids, form, purchase orders, etc.
    const [tenders, setTenders] = useState(initialTenders);
    const [bids, setBids] = useState(initialBids);
    const [form, setForm] = useState({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      budgetMin: "",
      budgetMax: "",
      deadline: "",
      attachments: [],
    });
    const today = new Date().toISOString().split("T")[0];
    const [poForm, setPoForm] = useState({
      tenderId: "",
      vendor: "",
      poNumber: "",
      issueDate: today,
      amount: "",
      notes: "",
    });
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [winnerTenderId, setWinnerTenderId] = useState("");
    const [selectedBidId, setSelectedBidId] = useState("");
  const [activeTab, setActiveTab] = useState("handleRequests");
  // Notification state and function
  const [notification, setNotification] = useState("");
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };


  // --- Helper and handler functions moved above ---


  return (
    <MainLayout title="Procurement">
      <div className="sv-main-content">
        {notification && (
          <div className="sv-notification sv-notification-success">{notification}</div>
        )}

        <div className="sv-tabs">
          <button
            className={`sv-tab${activeTab === "handleRequests" ? " sv-tab-active" : ""}`}
            onClick={() => setActiveTab("handleRequests")}
          >Handle Requests</button>
          <button
            className={`sv-tab${activeTab === "createTender" ? " sv-tab-active" : ""}`}
            onClick={() => setActiveTab("createTender")}
          >Create Tender</button>
          <button
            className={`sv-tab${activeTab === "viewBids" ? " sv-tab-active" : ""}`}
            onClick={() => setActiveTab("viewBids")}
          >View Vendor Bids</button>
          <button
            className={`sv-tab${activeTab === "selectWinner" ? " sv-tab-active" : ""}`}
            onClick={() => setActiveTab("selectWinner")}
          >Select Winning Vendor</button>
          <button
            className={`sv-tab${activeTab === "issuePO" ? " sv-tab-active" : ""}`}
            onClick={() => setActiveTab("issuePO")}
          >Issue Purchase Order</button>
        </div>

        {activeTab === "handleRequests" && (
          <HandleRequestsTab />
        )}

        {activeTab === "createTender" && (
          <div className="sv-tab-content">
            <div className="sv-card sv-form-card">
              <h2 className="sv-card-title">Create Tender</h2>
              <form className="sv-form" onSubmit={handleSubmit}>
                <div className="sv-form-group">
                  <label>Tender Title</label>
                  <input name="title" type="text" value={form.title} onChange={handleInputChange} required />
                </div>
                <div className="sv-form-group">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleInputChange} required />
                </div>
                <div className="sv-form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    {Object.keys(categoryOptions).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="sv-form-group">
                  <label>Subcategory</label>
                  <select name="subcategory" value={form.subcategory} onChange={handleInputChange} required disabled={!form.category}>
                    <option value="">{form.category ? "Select Subcategory" : "Select Category First"}</option>
                    {form.category && categoryOptions[form.category].map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className="sv-form-group">
                  <label>Budget Min</label>
                  <input name="budgetMin" type="number" value={form.budgetMin} onChange={handleInputChange} min="0" required />
                </div>
                <div className="sv-form-group">
                  <label>Budget Max</label>
                  <input name="budgetMax" type="number" value={form.budgetMax} onChange={handleInputChange} min={form.budgetMin || 0} required />
                </div>
                <div className="sv-form-group">
                  <label>Submission Deadline</label>
                  <input name="deadline" type="date" value={form.deadline} onChange={handleInputChange} min={today} required />
                </div>
                <div className="sv-form-group">
                  <label>Attachments</label>
                  <input name="attachments" type="file" onChange={handleInputChange} multiple />
                </div>
                <button type="submit" className="sv-btn-primary">Submit</button>
              </form>
            </div>
            <div className="sv-section">
              <h3 className="sv-section-title">Active Tenders</h3>
              {tenders.filter(t => t.status === "Open").length === 0 ? (
                <div className="sv-empty-state">No tenders available</div>
              ) : (
                <div className="sv-table-container">
                  <table className="sv-table sv-table-striped sv-table-rounded">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Budget</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenders.filter(t => t.status === "Open").map((tender) => (
                        <tr key={tender.id}>
                          <td>{tender.id}</td>
                          <td>{tender.title}</td>
                          <td>{tender.category}</td>
                          <td>{tender.subcategory}</td>
                          <td>{tender.budget.min} - {tender.budget.max}</td>
                          <td>{tender.deadline}</td>
                          <td>
                            <button className="sv-btn-primary" style={{marginRight: 8}}>View Bids</button>
                            <button className="sv-btn-green">Select Winner</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="sv-section">
              <h3 className="sv-section-title">Closed Tenders</h3>
              {tenders.filter(t => t.status === "Closed").length === 0 ? (
                <div className="sv-empty-state">No closed tenders</div>
              ) : (
                <div className="sv-table-container">
                  <table className="sv-table sv-table-striped sv-table-rounded">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Budget</th>
                        <th>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenders.filter(t => t.status === "Closed").map((tender) => (
                        <tr key={tender.id}>
                          <td>{tender.id}</td>
                          <td>{tender.title}</td>
                          <td>{tender.category}</td>
                          <td>{tender.subcategory}</td>
                          <td>{tender.budget.min} - {tender.budget.max}</td>
                          <td>{tender.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "viewBids" && (
          <div className="sv-tab-content">
            <h3>Vendor Bids</h3>
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Bid ID</th>
                  <th>Tender ID</th>
                  <th>Vendor Name</th>
                  <th>Bid Amount</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid.id}>
                    <td>{bid.id}</td>
                    <td>{bid.tenderId}</td>
                    <td>{bid.vendor}</td>
                    <td>{bid.amount}</td>
                    <td>{bid.date}</td>
                    <td>{bid.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "selectWinner" && (
          <div>
            <h3>Select Winning Vendor</h3>
            <div>
              <label>Select Tender: </label>
              <select value={winnerTenderId} onChange={handleSelectWinnerTender}>
                <option value="">Select Tender</option>
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                ))}
              </select>
            </div>
            {winnerTenderId && (
              <>
                <div style={{margin: '12px 0'}}>
                  <button
                    className="sv-btn-green"
                    onClick={() => {
                      const tender = tenders.find(t => t.id === winnerTenderId);
                      if (!tender) return;
                      const filteredBids = bids.filter(b => b.tenderId === winnerTenderId && b.amount >= tender.budget.min && b.amount <= tender.budget.max);
                      if (filteredBids.length === 0) {
                        showNotification('No bids within budget range.');
                        return;
                      }
                      const lowestBid = filteredBids.reduce((min, b) => b.amount < min.amount ? b : min, filteredBids[0]);
                      handleSelectWinner(lowestBid.id);
                    }}
                  >Select Lowest Bidder Within Budget</button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Bid ID</th>
                      <th>Vendor Name</th>
                      <th>Bid Amount</th>
                      <th>Status</th>
                      <th>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.filter((b) => b.tenderId === winnerTenderId).map((bid) => (
                      <tr key={bid.id}>
                        <td>{bid.id}</td>
                        <td>{bid.vendor}</td>
                        <td>{bid.amount}</td>
                        <td>{bid.status}</td>
                        <td>
                          <button onClick={() => handleSelectWinner(bid.id)} disabled={bid.status === "Winner"}>Select</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {activeTab === "issuePO" && (
          <div className="sv-tab-content">
            <div className="sv-card sv-form-card">
              <h2 className="sv-card-title">Issue Purchase Order</h2>
              <form className="sv-form" onSubmit={handlePoSubmit}>
                <div className="sv-form-group">
                  <label>Select Tender: </label>
                  <select name="tenderId" value={poForm.tenderId} onChange={handlePoTenderChange} required>
                    <option value="">Select Tender</option>
                    {tenders.filter((t) => t.status !== "Closed").map((t) => (
                      <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                    ))}
                  </select>
                </div>
                <div className="sv-form-group">
                  <label>Select Vendor: </label>
                  <select name="vendor" value={poForm.vendor} onChange={handlePoVendorChange} required disabled={!poForm.tenderId}>
                    <option value="">Select Vendor</option>
                    {bids.filter((b) => b.tenderId === poForm.tenderId && b.status === "Winner").map((b) => (
                      <option key={b.vendor} value={b.vendor}>{b.vendor}</option>
                    ))}
                  </select>
                </div>
                <div className="sv-form-group">
                  <label>PO Number: </label>
                  <input name="poNumber" type="text" value={poForm.poNumber || getNextPoNumber()} readOnly />
                </div>
                <div className="sv-form-group">
                  <label>Issue Date: </label>
                  <input name="issueDate" type="date" value={poForm.issueDate} onChange={handlePoInputChange} required />
                </div>
                <div className="sv-form-group">
                  <label>Amount: </label>
                  <input name="amount" type="number" value={poForm.amount} readOnly />
                </div>
                <div className="sv-form-group">
                  <label>Notes: </label>
                  <textarea name="notes" value={poForm.notes} onChange={handlePoInputChange} />
                </div>
                <button type="submit" className="sv-btn-primary">Submit</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default ProcurementDashboard;
