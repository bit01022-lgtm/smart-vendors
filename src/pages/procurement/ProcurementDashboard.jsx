

import React, { useState } from "react";
import MainLayout from '../../components/layout/MainLayout';
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
  const [activeTab, setActiveTab] = useState("createTender");
  // Notification state and function
  const [notification, setNotification] = useState("");
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };


  // --- Helper and handler functions moved above ---


  return (
    <MainLayout title="Procurement">
      {notification && (
        <div className="sv-notification sv-notification-success">{notification}</div>
      )}
      <div className="sv-tabs">
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

      {activeTab === "createTender" && (
        <div className="sv-tab-content">
          <form className="sv-form" onSubmit={handleSubmit}>
            <div>
              <label>Tender Title</label>
              <input name="title" type="text" value={form.title} onChange={handleInputChange} required />
            </div>
            <div>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleInputChange} required />
            </div>
            <div>
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleInputChange} required>
                <option value="">Select Category</option>
                {Object.keys(categoryOptions).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Subcategory</label>
              <select name="subcategory" value={form.subcategory} onChange={handleInputChange} required disabled={!form.category}>
                <option value="">{form.category ? "Select Subcategory" : "Select Category First"}</option>
                {form.category && categoryOptions[form.category].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Budget Min</label>
              <input name="budgetMin" type="number" value={form.budgetMin} onChange={handleInputChange} min="0" required />
            </div>
            <div>
              <label>Budget Max</label>
              <input name="budgetMax" type="number" value={form.budgetMax} onChange={handleInputChange} min={form.budgetMin || 0} required />
            </div>
            <div>
              <label>Submission Deadline</label>
              <input name="deadline" type="date" value={form.deadline} onChange={handleInputChange} min={today} required />
            </div>
            <div>
              <label>Attachments</label>
              <input name="attachments" type="file" onChange={handleInputChange} multiple />
            </div>
            <button type="submit">Submit</button>
          </form>
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
          )}
        </div>
      )}

      {activeTab === "issuePO" && (
        <div>
          <h3>Issue Purchase Order</h3>
          <form onSubmit={handlePoSubmit}>
            <div>
              <label>Select Tender: </label>
              <select name="tenderId" value={poForm.tenderId} onChange={handlePoTenderChange} required>
                <option value="">Select Tender</option>
                {tenders.filter((t) => t.status !== "Closed").map((t) => (
                  <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Select Vendor: </label>
              <select name="vendor" value={poForm.vendor} onChange={handlePoVendorChange} required disabled={!poForm.tenderId}>
                <option value="">Select Vendor</option>
                {bids.filter((b) => b.tenderId === poForm.tenderId && b.status === "Winner").map((b) => (
                  <option key={b.vendor} value={b.vendor}>{b.vendor}</option>
                ))}
              </select>
            </div>
            <div>
              <label>PO Number: </label>
              <input name="poNumber" type="text" value={poForm.poNumber || getNextPoNumber()} readOnly />
            </div>
            <div>
              <label>Issue Date: </label>
              <input name="issueDate" type="date" value={poForm.issueDate} onChange={handlePoInputChange} required />
            </div>
            <div>
              <label>Amount: </label>
              <input name="amount" type="number" value={poForm.amount} readOnly />
            </div>
            <div>
              <label>Notes: </label>
              <textarea name="notes" value={poForm.notes} onChange={handlePoInputChange} />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </MainLayout>
  );
}

export default ProcurementDashboard;
