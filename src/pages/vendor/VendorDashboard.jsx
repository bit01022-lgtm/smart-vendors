

import React, { useState } from "react";
import MainLayout from '../../components/layout/MainLayout';

import '../../styles/DashboardStyles.css';

  // ...existing code...

const initialTenders = [
  {
    id: "TND-001",
    title: "Laptop Procurement",
    category: "Computing Hardware",
    subcategory: "Laptops",
    budget: { min: 50000, max: 70000 },
    deadline: "2026-04-10",
    status: "Open",
  },
  {
    id: "TND-002",
    title: "Projector Procurement",
    category: "Consumer Electronics",
    subcategory: "Projectors",
    budget: { min: 15000, max: 25000 },
    deadline: "2026-04-15",
    status: "Open",
  },
];

function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("vendorRegistration");
  // Notification state and function
  const [notification, setNotification] = useState("");
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };
  const [documents, setDocuments] = useState([]);
  const [tenders, setTenders] = useState(initialTenders);
  const [bids, setBids] = useState([]);
  const [invoices, setInvoices] = useState(() => {
    const stored = localStorage.getItem('vendorInvoices');
    return stored ? JSON.parse(stored) : [];
  });

  // Upload Documents State
  const [docFiles, setDocFiles] = useState([]);
  const [docNotes, setDocNotes] = useState("");
  const [docName, setDocName] = useState("");
  const [customDocName, setCustomDocName] = useState("");
  const [editDocId, setEditDocId] = useState(null);
  const [editDocNotes, setEditDocNotes] = useState("");

  const getNextDocId = () => {
    return `DOC-${(documents.length + 1).toString().padStart(3, "0")}`;
  };

  const handleDocFileChange = (e) => {
    setDocFiles(e.target.files ? Array.from(e.target.files) : []);
  };

  const handleDocNotesChange = (e) => {
    setDocNotes(e.target.value);
  };

  const handleDocNameChange = (e) => {
    setDocName(e.target.value);
    if (e.target.value !== "custom") setCustomDocName("");
  };
  const handleCustomDocNameChange = (e) => setCustomDocName(e.target.value);

  const handleDocSubmit = (e) => {
    e.preventDefault();
    if (docFiles.length === 0) return;
    const docTypeName = docName === "custom" ? customDocName : docName;
    const newDocs = docFiles.map((file, idx) => ({
      id: getNextDocId(),
      name: docTypeName || file.name,
      notes: docNotes,
      file,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
    setDocFiles([]);
    setDocNotes("");
    setDocName("");
    setCustomDocName("");
    e.target.reset();
    showNotification("Document uploaded successfully.");
  };

  const handleEditDoc = (doc) => {
    setEditDocId(doc.id);
    setEditDocNotes(doc.notes);
  };

  const handleEditDocNotesChange = (e) => {
    setEditDocNotes(e.target.value);
  };

  const handleEditDocSave = (docId) => {
    setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, notes: editDocNotes } : d));
    setEditDocId(null);
    setEditDocNotes("");
    showNotification("Document note updated.");
  };

  const handleDeleteDoc = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showNotification("Document deleted.");
  };

  // Tender Filtering
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBudget, setFilterBudget] = useState("");
  const [filterDeadline, setFilterDeadline] = useState("");

  const filteredTenders = tenders.filter((t) => {
    if (t.status !== "Open") return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterBudget && (t.budget.min > Number(filterBudget) || t.budget.max < Number(filterBudget))) return false;
    if (filterDeadline && t.deadline !== filterDeadline) return false;
    return true;
  });

  const mainCategories = [
    "Computing Hardware",
    "Consumer Electronics",
    "Networking Equipment",
    "Peripherals & Accessories",
    "Software / Applications",
  ];

  // Download placeholder
  const handleDownloadTender = (tender) => {
    alert(`Download for ${tender.title} (${tender.id})`);
  };

  // --- Submit Bids State ---
  const [bidTenderId, setBidTenderId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [bidFiles, setBidFiles] = useState([]);
  const [editBidId, setEditBidId] = useState(null);
  const [editBidAmount, setEditBidAmount] = useState("");
  const [editBidNotes, setEditBidNotes] = useState("");
  const [editBidFiles, setEditBidFiles] = useState([]);
  const [filterBidTender, setFilterBidTender] = useState("");
  const [filterBidAmount, setFilterBidAmount] = useState("");
  const [filterBidStatus, setFilterBidStatus] = useState("");

  const getNextBidId = () => {
    return `BID-${(bids.length + 1).toString().padStart(3, "0")}`;
  };

  const handleBidTenderChange = (e) => setBidTenderId(e.target.value);
  const handleBidAmountChange = (e) => setBidAmount(e.target.value);
  const handleBidNotesChange = (e) => setBidNotes(e.target.value);
  const handleBidFilesChange = (e) => setBidFiles(e.target.files ? Array.from(e.target.files) : []);

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!bidTenderId || !bidAmount) return;
    setBids((prev) => [
      ...prev,
      {
        id: getNextBidId(),
        tenderId: bidTenderId,
        amount: Number(bidAmount),
        notes: bidNotes,
        files: bidFiles,
        status: "Submitted",
      },
    ]);
    setBidTenderId("");
    setBidAmount("");
    setBidNotes("");
    setBidFiles([]);
    e.target.reset();
    showNotification("Bid submitted successfully.");
  };

  const handleEditBid = (bid) => {
    setEditBidId(bid.id);
    setEditBidAmount(bid.amount);
    setEditBidNotes(bid.notes);
    setEditBidFiles(bid.files || []);
  };
  const handleEditBidAmountChange = (e) => setEditBidAmount(e.target.value);
  const handleEditBidNotesChange = (e) => setEditBidNotes(e.target.value);
  const handleEditBidFilesChange = (e) => setEditBidFiles(e.target.files ? Array.from(e.target.files) : []);
  const handleEditBidSave = (bidId) => {
    setBids((prev) => prev.map((b) => b.id === bidId ? { ...b, amount: Number(editBidAmount), notes: editBidNotes, files: editBidFiles } : b));
    setEditBidId(null);
    setEditBidAmount("");
    setEditBidNotes("");
    setEditBidFiles([]);
    showNotification("Bid updated.");
  };
  const handleDeleteBid = (bidId) => {
    setBids((prev) => prev.filter((b) => b.id !== bidId));
    showNotification("Bid deleted.");
  };
  const handleDownloadBid = (bid) => {
    alert(`Download for ${bid.id}`);
  };
  const filteredBids = bids.filter((b) => {
    if (filterBidTender && b.tenderId !== filterBidTender) return false;
    if (filterBidAmount && b.amount !== Number(filterBidAmount)) return false;
    if (filterBidStatus && b.status !== filterBidStatus) return false;
    return true;
  });

  // --- Upload Invoices State ---
  const [invoicePo, setInvoicePo] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const getNextInvoiceId = () => {
    return `INV-${(invoices.length + 1).toString().padStart(3, "0")}`;
  };
  const handleInvoicePoChange = (e) => setInvoicePo(e.target.value);
  const handleInvoiceFileChange = (e) => setInvoiceFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
  const handleInvoiceNotesChange = (e) => setInvoiceNotes(e.target.value);
  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!invoicePo || !invoiceFile || !invoiceAmount || !invoiceName) return;
    const newInvoice = {
      id: getNextInvoiceId(),
      po: invoicePo,
      name: invoiceName,
      amount: Number(invoiceAmount),
      file: invoiceFile ? invoiceFile.name : '',
      notes: invoiceNotes,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };
    setInvoices((prev) => {
      const updated = [...prev, newInvoice];
      localStorage.setItem('vendorInvoices', JSON.stringify(updated));
      return updated;
    });
    setInvoicePo("");
    setInvoiceFile(null);
    setInvoiceNotes("");
    setInvoiceAmount("");
    setInvoiceName("");
    e.target.reset();
    showNotification("Invoice uploaded successfully.");
  };

  // Dummy POs for dropdown (simulate issued POs)
  const issuedPOs = [
    { id: "PO-001", tenderId: "TND-001" },
    { id: "PO-002", tenderId: "TND-002" },
  ];

  return (
    <MainLayout title="Vendor">
      {/* Removed icon space for role as well */}
      <div className="sv-main-content">
        {notification && (
          <div className="sv-notification sv-notification-success">{notification}</div>
        )}
        <div className="sv-tabs">
          <button className={`sv-tab${activeTab === "vendorRegistration" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("vendorRegistration")}>Vendor Registration</button>
          <button className={`sv-tab${activeTab === "viewTenders" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("viewTenders")}>View Open Tenders</button>
          <button className={`sv-tab${activeTab === "submitBids" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("submitBids")}>Submit Bids</button>
          <button className={`sv-tab${activeTab === "uploadInvoices" ? " sv-tab-active" : ""}`} onClick={() => setActiveTab("uploadInvoices")}>Upload Invoices</button>
        </div>

        {activeTab === "vendorRegistration" && (
          <div className="sv-tab-content">
            <h2>Vendor Registration</h2>
            <form className="sv-form" style={{marginBottom: 24}}>
              <div className="sv-form-group">
                <label>Company Name:</label>
                <input type="text" placeholder="Enter company name" required />
              </div>
              <div className="sv-form-group">
                <label>Company Registration Number:</label>
                <input type="text" placeholder="Enter registration number" required />
              </div>
              <div className="sv-form-group">
                <label>Company Email:</label>
                <input type="email" placeholder="Enter company email" required />
              </div>
              <div className="sv-form-group">
                <label>Company Phone:</label>
                <input type="tel" placeholder="Enter company phone" required />
              </div>
              <div className="sv-form-group">
                <label>Company Address:</label>
                <input type="text" placeholder="Enter company address" required />
              </div>
            </form>
            <form className="sv-form" onSubmit={handleDocSubmit}>
              <div>
                <label>Document Name: </label>
                <select value={docName} onChange={handleDocNameChange} required>
                  <option value="">Select Document Type</option>
                  <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                  <option value="Tax Clearance Certificate">Tax Clearance Certificate</option>
                  <option value="custom">Other (Custom Name)</option>
                </select>
                {docName === "custom" && (
                  <input type="text" placeholder="Enter custom document name" value={customDocName} onChange={handleCustomDocNameChange} required />
                )}
              </div>
              <div>
                <label>Upload Files: </label>
                <input type="file" multiple onChange={handleDocFileChange} />
              </div>
              <div>
                <label>Notes/Description: </label>
                <input type="text" value={docNotes} onChange={handleDocNotesChange} />
              </div>
              <button type="submit">Submit</button>
            </form>
            <h3>Uploaded Documents</h3>
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Name</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.name}</td>
                    <td>
                    {editDocId === doc.id ? (
                      <span>
                        <input type="text" value={editDocNotes} onChange={handleEditDocNotesChange} />
                        <button onClick={() => handleEditDocSave(doc.id)}>Save</button>
                        <button onClick={() => setEditDocId(null)}>Cancel</button>
                      </span>
                    ) : (
                      <span>{doc.notes}</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleEditDoc(doc)}>Edit</button>
                    <button onClick={() => handleDeleteDoc(doc.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "viewTenders" && (
        <div className="sv-tab-content">
          <h3>Open Tenders</h3>
          <div className="dashboard-filters">
            <label>Category: </label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All</option>
              {mainCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label>Budget: </label>
            <input type="number" value={filterBudget} onChange={(e) => setFilterBudget(e.target.value)} placeholder="Any" />
            <label>Deadline: </label>
            <input type="date" value={filterDeadline} onChange={(e) => setFilterDeadline(e.target.value)} />
          </div>
          <div className="sv-tender-cards">
            {filteredTenders.length === 0 ? (
              <div className="sv-empty-state">No open tenders available</div>
            ) : (
              filteredTenders.map((t) => (
                <div className="sv-tender-card" key={t.id}>
                  <div className="sv-tender-title">{t.title}</div>
                  <div className="sv-tender-info">
                    <span><strong>Budget:</strong> {t.budget.min} - {t.budget.max}</span>
                    <span><strong>Deadline:</strong> {t.deadline}</span>
                  </div>
                  <button className="sv-btn-primary sv-btn-bid">Submit Bid</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "submitBids" && (
        <div className="sv-tab-content">
          <form className="sv-form" onSubmit={handleBidSubmit}>
            <div className="sv-form-group">
              <label>Select Tender:</label>
              <select value={bidTenderId} onChange={handleBidTenderChange} required>
                <option value="">Select Tender</option>
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                ))}
              </select>
            </div>
            <div className="sv-form-group">
              <label>Bid Amount:</label>
              <input type="number" value={bidAmount} onChange={handleBidAmountChange} required />
            </div>
            <div className="sv-form-group">
              <label>Notes/Description:</label>
              <input type="text" value={bidNotes} onChange={handleBidNotesChange} />
            </div>
            <div className="sv-form-group">
              <label>Upload Bid Files:</label>
              <input type="file" multiple onChange={handleBidFilesChange} />
            </div>
            <button type="submit">Submit</button>
          </form>
          <h3>Submitted Bids</h3>
          <div className="dashboard-filters">
            <label>Filter by Tender: </label>
            <select value={filterBidTender} onChange={(e) => setFilterBidTender(e.target.value)}>
              <option value="">All</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
              ))}
            </select>
            <label>Amount: </label>
            <input type="number" value={filterBidAmount} onChange={(e) => setFilterBidAmount(e.target.value)} placeholder="Any" />
            <label>Status: </label>
            <select value={filterBidStatus} onChange={(e) => setFilterBidStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Submitted">Submitted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <table className="sv-table">
            <thead>
              <tr>
                <th>Bid ID</th>
                <th>Tender</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {filteredBids.map((bid) => (
                <tr key={bid.id}>
                  <td>{bid.id}</td>
                  <td>{bid.tenderId}</td>
                  <td>
                    {editBidId === bid.id ? (
                      <input type="number" value={editBidAmount} onChange={handleEditBidAmountChange} />
                    ) : (
                      bid.amount
                    )}
                  </td>
                  <td>
                    {editBidId === bid.id ? (
                      <input type="text" value={editBidNotes} onChange={handleEditBidNotesChange} />
                    ) : (
                      bid.notes
                    )}
                  </td>
                  <td>{bid.status}</td>
                  <td>
                    {editBidId === bid.id ? (
                      <span>
                        <button onClick={() => handleEditBidSave(bid.id)}>Save</button>
                        <button onClick={() => setEditBidId(null)}>Cancel</button>
                      </span>
                    ) : (
                      <span>
                        <button onClick={() => handleEditBid(bid)}>Edit</button>
                        <button onClick={() => handleDeleteBid(bid.id)}>Delete</button>
                      </span>
                    )}
                  </td>
                  <td><button onClick={() => handleDownloadBid(bid)}>Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "uploadInvoices" && (
        <div className="sv-tab-content">
          <div className="sv-card sv-form-card">
            <h2 className="sv-card-title">Upload Invoices</h2>
            <form className="sv-form" onSubmit={handleInvoiceSubmit}>
              <div className="sv-form-group">
                <label>Select Purchase Order: </label>
                <select value={invoicePo} onChange={handleInvoicePoChange} required>
                  <option value="">Select PO</option>
                  {issuedPOs.map((po) => (
                    <option key={po.id} value={po.id}>{po.id} (Tender: {po.tenderId})</option>
                  ))}
                </select>
              </div>
              <div className="sv-form-group">
                <label>Invoice File: </label>
                <input type="file" onChange={handleInvoiceFileChange} required />
              </div>
              <div className="sv-form-group">
                <label>Notes: </label>
                <textarea value={invoiceNotes} onChange={handleInvoiceNotesChange} />
              </div>
              <button type="submit" className="sv-btn-primary">Submit</button>
            </form>
          </div>
          <h3>Uploaded Invoices</h3>
          <table className="sv-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>PO</th>
                <th>File</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.po}</td>
                  <td>{inv.file ? inv.file.name : ""}</td>
                  <td>{inv.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </MainLayout>
  );
}

export default VendorDashboard;
