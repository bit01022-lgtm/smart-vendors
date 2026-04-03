

import React, { useEffect, useRef, useState } from "react";
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/useAuth';
import {
  saveProcurementBids,
  saveVendorRegistration,
  saveVendorInvoices,
  subscribeProcurementBids,
  subscribeProcurementTenders,
  subscribeVendorRegistration,
  subscribeVendorInvoices,
} from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';
import {
  formatFileSize,
  isAllowedFileType,
  MAX_FILE_SIZE_BYTES,
  persistFile,
} from '../../services/filePersistenceService';

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
  const { currentUser } = useAuth();
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
  const [invoices, setInvoices] = useState([]);
  const [registration, setRegistration] = useState({
    companyName: '',
    registrationNumber: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    status: 'Pending',
  });
  const isRegistrationDirtyRef = useRef(false);
  const lastSyncedRegistrationAtRef = useRef('');

  // Upload Documents State
  const [docFiles, setDocFiles] = useState([]);
  const [docNotes, setDocNotes] = useState("");
  const [docName, setDocName] = useState("");
  const [customDocName, setCustomDocName] = useState("");
  const [editDocId, setEditDocId] = useState(null);
  const [editDocNotes, setEditDocNotes] = useState("");
  const MAX_FILE_SIZE_LABEL = formatFileSize(MAX_FILE_SIZE_BYTES);

  const handleDocFileChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const accepted = [];
    let invalidTypeCount = 0;
    let oversizedNonImageCount = 0;

    files.forEach((file) => {
      if (!isAllowedFileType(file)) {
        invalidTypeCount += 1;
        return;
      }

      if (!file.type.startsWith('image/') && file.size > MAX_FILE_SIZE_BYTES) {
        oversizedNonImageCount += 1;
        return;
      }

      accepted.push(file);
    });

    setDocFiles(accepted);

    if (invalidTypeCount || oversizedNonImageCount) {
      showNotification(
        `Some files were skipped (type/size). Allowed: PDF, JPG, PNG. Max: ${MAX_FILE_SIZE_LABEL}.`
      );
    }
  };

  const handleDocNotesChange = (e) => {
    setDocNotes(e.target.value);
  };

  const handleDocNameChange = (e) => {
    setDocName(e.target.value);
    if (e.target.value !== "custom") setCustomDocName("");
  };
  const handleCustomDocNameChange = (e) => setCustomDocName(e.target.value);

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    isRegistrationDirtyRef.current = true;
    setRegistration((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    const uid = currentUser?.uid;
    if (!uid) {
      showNotification('You must be logged in before saving registration.');
      return;
    }

    const nextRegistration = {
      id: uid,
      ownerUid: uid,
      vendorEmail: currentUser?.email || registration.companyEmail,
      ...registration,
      status: registration.status || 'Pending',
      documents,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveVendorRegistration(uid, nextRegistration);
      isRegistrationDirtyRef.current = false;
      lastSyncedRegistrationAtRef.current = nextRegistration.updatedAt;
    } catch {
      showNotification('Vendor registration could not be saved.');
      return;
    }

    // Activity logging is best-effort and should not block vendor registration success.
    await logActivity({
      type: 'Vendor Registration',
      reference: nextRegistration.companyName || uid,
      user: currentUser?.email || 'Vendor User',
      status: 'Submitted',
    }).catch(() => {});

    showNotification('Vendor registration saved.');
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (docFiles.length === 0) return;

    const uid = currentUser?.uid;
    if (!uid) {
      showNotification('You must be logged in before uploading documents.');
      return;
    }

    const docTypeName = docName === "custom" ? customDocName : docName;

    let uploadedDocs;
    try {
      uploadedDocs = await Promise.all(
        docFiles.map(async (file, index) => {
          const persisted = await persistFile(file);
          return {
            id: `DOC-${Date.now()}-${index + 1}`,
            name: docTypeName || file.name,
            notes: docNotes,
            fileName: persisted.fileName,
            fileUrl: persisted.fileUrl,
            contentType: persisted.contentType,
            size: persisted.size,
            uploadedAt: new Date().toISOString(),
          };
        })
      );
    } catch (error) {
      if (error.message === 'FILE_TYPE_NOT_ALLOWED') {
        showNotification('Only PDF, JPG, and PNG files are allowed.');
        return;
      }

      if (error.message === 'FILE_TOO_LARGE') {
        showNotification(`Each document must be <= ${MAX_FILE_SIZE_LABEL} (images are auto-compressed).`);
        return;
      }

      showNotification('Unable to process one or more selected files.');
      return;
    }

    const updatedDocuments = [...documents, ...uploadedDocs];
    setDocuments(updatedDocuments);

    await saveVendorRegistration(uid, {
      id: uid,
      ownerUid: uid,
      vendorEmail: currentUser?.email || registration.companyEmail,
      ...registration,
      status: registration.status || 'Pending',
      documents: updatedDocuments,
      updatedAt: new Date().toISOString(),
    });

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

  const handleEditDocSave = async (docId) => {
    const uid = currentUser?.uid;
    const updatedDocuments = documents.map((d) => (d.id === docId ? { ...d, notes: editDocNotes } : d));
    setDocuments(updatedDocuments);

    if (uid) {
      await saveVendorRegistration(uid, {
        id: uid,
        ownerUid: uid,
        vendorEmail: currentUser?.email || registration.companyEmail,
        ...registration,
        status: registration.status || 'Pending',
        documents: updatedDocuments,
        updatedAt: new Date().toISOString(),
      });
    }

    setEditDocId(null);
    setEditDocNotes("");
    showNotification("Document note updated.");
  };

  const handleDeleteDoc = async (docId) => {
    const uid = currentUser?.uid;
    const updatedDocuments = documents.filter((d) => d.id !== docId);
    setDocuments(updatedDocuments);

    if (uid) {
      await saveVendorRegistration(uid, {
        id: uid,
        ownerUid: uid,
        vendorEmail: currentUser?.email || registration.companyEmail,
        ...registration,
        status: registration.status || 'Pending',
        documents: updatedDocuments,
        updatedAt: new Date().toISOString(),
      });
    }

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

  useEffect(() => {
    const uid = currentUser?.uid;

    if (!uid) {
      return undefined;
    }

    const unsubscribeRegistration = subscribeVendorRegistration(uid, (value) => {
      if (value) {
        const incomingUpdatedAt = String(value.updatedAt || '');

        // Never overwrite the form while the user is actively editing.
        if (isRegistrationDirtyRef.current) {
          return;
        }

        setRegistration({
          companyName: value.companyName || '',
          registrationNumber: value.registrationNumber || '',
          companyEmail: value.companyEmail || '',
          companyPhone: value.companyPhone || '',
          companyAddress: value.companyAddress || '',
          status: value.status || 'Pending',
        });
        setDocuments(Array.isArray(value.documents) ? value.documents : []);
        isRegistrationDirtyRef.current = false;
        if (incomingUpdatedAt) {
          lastSyncedRegistrationAtRef.current = incomingUpdatedAt;
        }
      }
    });
    const unsubscribeTenders = subscribeProcurementTenders(setTenders, initialTenders);
    const unsubscribeBids = subscribeProcurementBids(setBids, []);
    const unsubscribeInvoices = subscribeVendorInvoices(uid, setInvoices, []);

    return () => {
      unsubscribeRegistration();
      unsubscribeTenders();
      unsubscribeBids();
      unsubscribeInvoices();
    };
  }, [currentUser]);

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
    const nextBids = [
      ...bids,
      {
        id: getNextBidId(),
        tenderId: bidTenderId,
        vendor: currentUser?.email || 'Vendor User',
        amount: Number(bidAmount),
        notes: bidNotes,
        files: bidFiles.map((file) => file.name),
        date: new Date().toISOString().slice(0, 10),
        status: "Submitted",
      },
    ];

    setBids(nextBids);
    saveProcurementBids(nextBids).catch(() => {});
    setBidTenderId("");
    setBidAmount("");
    setBidNotes("");
    setBidFiles([]);
    e.target.reset();
    logActivity({
      type: 'Vendor Bid Submitted',
      reference: nextBids[nextBids.length - 1]?.id || 'BID',
      user: currentUser?.email || 'Vendor User',
      status: 'Submitted',
    }).catch(() => {});
    showNotification("Bid submitted successfully.");
  };

  const handleEditBid = (bid) => {
    setEditBidId(bid.id);
    setEditBidAmount(bid.amount);
    setEditBidNotes(bid.notes);
    setEditBidFiles(Array.isArray(bid.files) ? bid.files : []);
  };
  const handleEditBidAmountChange = (e) => setEditBidAmount(e.target.value);
  const handleEditBidNotesChange = (e) => setEditBidNotes(e.target.value);
  const handleEditBidSave = (bidId) => {
    const nextBids = bids.map((b) =>
      b.id === bidId
        ? {
            ...b,
            amount: Number(editBidAmount),
            notes: editBidNotes,
            files: editBidFiles.map((file) => (typeof file === 'string' ? file : file.name)),
          }
        : b
    );

    setBids(nextBids);
    saveProcurementBids(nextBids).catch(() => {});
    setEditBidId(null);
    setEditBidAmount("");
    setEditBidNotes("");
    setEditBidFiles([]);
    logActivity({
      type: 'Vendor Bid Updated',
      reference: bidId,
      user: currentUser?.email || 'Vendor User',
      status: 'Submitted',
    }).catch(() => {});
    showNotification("Bid updated.");
  };
  const handleDeleteBid = (bidId) => {
    const nextBids = bids.filter((b) => b.id !== bidId);
    setBids(nextBids);
    saveProcurementBids(nextBids).catch(() => {});
    logActivity({
      type: 'Vendor Bid Deleted',
      reference: bidId,
      user: currentUser?.email || 'Vendor User',
      status: 'Deleted',
    }).catch(() => {});
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
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoicePo || !invoiceFile || !invoiceAmount || !invoiceName) return;

    const uid = currentUser?.uid;
    if (!uid) {
      showNotification('You must be logged in before uploading invoices.');
      return;
    }

    let uploadedInvoice;
    try {
      if (!isAllowedFileType(invoiceFile)) {
        showNotification('Only PDF, JPG, and PNG invoice files are allowed.');
        return;
      }

      uploadedInvoice = await persistFile(invoiceFile);
    } catch (error) {
      if (error.message === 'FILE_TYPE_NOT_ALLOWED') {
        showNotification('Only PDF, JPG, and PNG invoice files are allowed.');
        return;
      }

      if (error.message === 'FILE_TOO_LARGE') {
        showNotification(`Invoice file must be <= ${MAX_FILE_SIZE_LABEL} (images are auto-compressed).`);
        return;
      }

      showNotification('Unable to process invoice file.');
      return;
    }

    const newInvoice = {
      id: getNextInvoiceId(),
      ownerUid: uid,
      vendorName: currentUser?.email || 'Vendor User',
      source: 'v2',
      po: invoicePo,
      name: invoiceName,
      amount: Number(invoiceAmount),
      file: uploadedInvoice.fileName,
      fileUrl: uploadedInvoice.fileUrl,
      fileSize: uploadedInvoice.size,
      contentType: uploadedInvoice.contentType,
      notes: invoiceNotes,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };
    const updated = [...invoices, newInvoice];
    setInvoices(updated);
    saveVendorInvoices(uid, updated).catch(() => {});
    setInvoicePo("");
    setInvoiceFile(null);
    setInvoiceNotes("");
    setInvoiceAmount("");
    setInvoiceName("");
    e.target.reset();
    logActivity({
      type: 'Vendor Invoice Uploaded',
      reference: newInvoice.id,
      user: currentUser?.email || 'Vendor User',
      status: newInvoice.status,
    }).catch(() => {});
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
            <form className="sv-form" style={{marginBottom: 24}} onSubmit={handleRegistrationSubmit}>
              <div className="sv-form-group">
                <label>Company Name:</label>
                <input name="companyName" type="text" placeholder="Enter company name" value={registration.companyName} onChange={handleRegistrationChange} required />
              </div>
              <div className="sv-form-group">
                <label>Company Registration Number:</label>
                <input name="registrationNumber" type="text" placeholder="Enter registration number" value={registration.registrationNumber} onChange={handleRegistrationChange} required />
              </div>
              <div className="sv-form-group">
                <label>Company Email:</label>
                <input name="companyEmail" type="email" placeholder="Enter company email" value={registration.companyEmail} onChange={handleRegistrationChange} required />
              </div>
              <div className="sv-form-group">
                <label>Company Phone:</label>
                <input name="companyPhone" type="tel" placeholder="Enter company phone" value={registration.companyPhone} onChange={handleRegistrationChange} required />
              </div>
              <div className="sv-form-group">
                <label>Company Address:</label>
                <input name="companyAddress" type="text" placeholder="Enter company address" value={registration.companyAddress} onChange={handleRegistrationChange} required />
              </div>
              <button type="submit" className="sv-btn-primary">Save Registration</button>
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
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  Allowed: PDF, JPG, PNG. Max: {MAX_FILE_SIZE_LABEL} per file.
                </div>
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
                    <td>
                      {doc.fileUrl ? (
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer">{doc.name}</a>
                      ) : (
                        doc.name
                      )}
                    </td>
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
                <label>Invoice Name: </label>
                <input type="text" value={invoiceName} onChange={e => setInvoiceName(e.target.value)} required />
              </div>
              <div className="sv-form-group">
                <label>Invoice Amount: </label>
                <input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} required />
              </div>
              <div className="sv-form-group">
                <label>Invoice File: </label>
                <input type="file" onChange={handleInvoiceFileChange} required />
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  Allowed: PDF, JPG, PNG. Max: {MAX_FILE_SIZE_LABEL} per file.
                </div>
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
                  <td>
                    {inv.fileUrl ? (
                      <a href={inv.fileUrl} target="_blank" rel="noreferrer">{inv.file || ''}</a>
                    ) : (
                      inv.file || ''
                    )}
                  </td>
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
