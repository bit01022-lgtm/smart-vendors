

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
  uploadFiles,
} from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';
import {
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
} from '../../services/filePersistenceService';

 

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
  const buttonDanger = 'rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50';
  const tableWrap = 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm';
  const tableClass = 'min-w-full text-sm';
  const thClass = 'bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
  const tdClass = 'border-t border-slate-100 px-4 py-3 text-slate-700';
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
    let oversizedCount = 0;

    files.forEach((file) => {
      // Only check file size, accept all file types
      if (file.size > MAX_FILE_SIZE_BYTES) {
        oversizedCount += 1;
        return;
      }

      accepted.push(file);
    });

    setDocFiles(accepted);

    if (oversizedCount) {
      showNotification(
        `Some files were skipped due to size. Max: ${MAX_FILE_SIZE_LABEL} per file.`
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
      const uploadedFiles = await uploadFiles(docFiles);
      uploadedDocs = uploadedFiles.map((file, index) => ({
        id: `DOC-${Date.now()}-${index + 1}`,
        name: docTypeName || file.originalName,
        notes: docNotes,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        contentType: file.contentType,
        size: file.size,
        uploadedAt: file.uploadedAt,
      }));
    } catch (error) {
      if (error.code === 'FILE_TOO_LARGE') {
        showNotification('Each document must be <= 100MB.');
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
      // Upload via backend API for proper handling of all file types and sizes
      const uploadedFiles = await uploadFiles([invoiceFile]);
      if (!uploadedFiles || uploadedFiles.length === 0) {
        showNotification('Failed to upload invoice file.');
        return;
      }
      uploadedInvoice = uploadedFiles[0];
    } catch (error) {
      if (error.code === 'FILE_TOO_LARGE') {
        showNotification(`Invoice file must be <= ${MAX_FILE_SIZE_LABEL}.`);
        return;
      }

      showNotification('Unable to upload invoice file. Please try again.');
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
      <div className="space-y-6">
        {notification && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notification}</div>
        )}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button className={`${tabBase} ${activeTab === 'vendorRegistration' ? tabActive : tabInactive}`} onClick={() => setActiveTab("vendorRegistration")}>Vendor Registration</button>
          <button className={`${tabBase} ${activeTab === 'viewTenders' ? tabActive : tabInactive}`} onClick={() => setActiveTab("viewTenders")}>View Open Tenders</button>
          <button className={`${tabBase} ${activeTab === 'submitBids' ? tabActive : tabInactive}`} onClick={() => setActiveTab("submitBids")}>Submit Bids</button>
          <button className={`${tabBase} ${activeTab === 'uploadInvoices' ? tabActive : tabInactive}`} onClick={() => setActiveTab("uploadInvoices")}>Upload Invoices</button>
        </div>

        {activeTab === "vendorRegistration" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Vendor Registration</h2>
              <form className={formClass} onSubmit={handleRegistrationSubmit}>
                <div className={formGroupClass}>
                  <label className={labelClass}>Company Name:</label>
                  <input className={inputClass} name="companyName" type="text" placeholder="Enter company name" value={registration.companyName} onChange={handleRegistrationChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Company Registration Number:</label>
                  <input className={inputClass} name="registrationNumber" type="text" placeholder="Enter registration number" value={registration.registrationNumber} onChange={handleRegistrationChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Company Email:</label>
                  <input className={inputClass} name="companyEmail" type="email" placeholder="Enter company email" value={registration.companyEmail} onChange={handleRegistrationChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Company Phone:</label>
                  <input className={inputClass} name="companyPhone" type="tel" placeholder="Enter company phone" value={registration.companyPhone} onChange={handleRegistrationChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Company Address:</label>
                  <input className={inputClass} name="companyAddress" type="text" placeholder="Enter company address" value={registration.companyAddress} onChange={handleRegistrationChange} required />
                </div>
                <button type="submit" className={buttonPrimary}>Save Registration</button>
              </form>
              <div className={cardClass}>
                <h3 className="mb-4 text-base font-semibold text-slate-900">Upload Documents</h3>
                <form className={formClass} onSubmit={handleDocSubmit}>
                  <div className={formGroupClass}>
                    <label className={labelClass}>Document Name:</label>
                    <select className={selectClass} value={docName} onChange={handleDocNameChange} required>
                      <option value="">Select Document Type</option>
                      <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                      <option value="Tax Clearance Certificate">Tax Clearance Certificate</option>
                      <option value="custom">Other (Custom Name)</option>
                    </select>
                    {docName === "custom" && (
                      <input className={inputClass} type="text" placeholder="Enter custom document name" value={customDocName} onChange={handleCustomDocNameChange} required />
                    )}
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass}>Upload Files:</label>
                    <input className="text-sm text-slate-600" type="file" multiple onChange={handleDocFileChange} />
                    <div className="text-xs text-slate-500">All file types accepted. Max: {MAX_FILE_SIZE_LABEL} per file.</div>
                  </div>
                  <div className={formGroupClass}>
                    <label className={labelClass}>Notes/Description:</label>
                    <input className={inputClass} type="text" value={docNotes} onChange={handleDocNotesChange} />
                  </div>
                  <button type="submit" className={buttonPrimary}>Submit</button>
                </form>
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">Uploaded Documents</h3>
                <div className={tableWrap}>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Document ID</th>
                        <th className={thClass}>Name</th>
                        <th className={thClass}>Notes</th>
                        <th className={thClass}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className={tdClass}>{doc.id}</td>
                          <td className={tdClass}>
                            {doc.fileUrl ? (
                              <a className="text-blue-600 underline" href={doc.fileUrl} target="_blank" rel="noreferrer">{doc.name}</a>
                            ) : (
                              doc.name
                            )}
                          </td>
                          <td className={tdClass}>
                            {editDocId === doc.id ? (
                              <span className="flex flex-wrap gap-2">
                                <input className={inputClass} type="text" value={editDocNotes} onChange={handleEditDocNotesChange} />
                                <button className={buttonPrimary} onClick={() => handleEditDocSave(doc.id)}>Save</button>
                                <button className={buttonGhost} onClick={() => setEditDocId(null)}>Cancel</button>
                              </span>
                            ) : (
                              <span>{doc.notes}</span>
                            )}
                          </td>
                          <td className={tdClass}>
                            <div className="flex flex-wrap gap-2">
                              <button className={buttonGhost} onClick={() => handleEditDoc(doc)}>Edit</button>
                              <button className={buttonDanger} onClick={() => handleDeleteDoc(doc.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        )}

      {activeTab === "viewTenders" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Open Tenders</h3>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className={labelClass}>Category:</label>
            <select className={selectClass} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All</option>
              {mainCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label className={labelClass}>Budget:</label>
            <input className={inputClass} type="number" value={filterBudget} onChange={(e) => setFilterBudget(e.target.value)} placeholder="Any" />
            <label className={labelClass}>Deadline:</label>
            <input className={inputClass} type="date" value={filterDeadline} onChange={(e) => setFilterDeadline(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTenders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">No open tenders available</div>
            ) : (
              filteredTenders.map((t) => (
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={t.id}>
                  <div>
                    <div className="text-base font-semibold text-slate-900">{t.title}</div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <div><span className="font-semibold text-slate-700">Budget:</span> {t.budget.min} - {t.budget.max}</div>
                      <div><span className="font-semibold text-slate-700">Deadline:</span> {t.deadline}</div>
                    </div>
                  </div>
                  <button className={buttonPrimary}>Submit Bid</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "submitBids" && (
        <div className="space-y-6">
          <form className={formClass} onSubmit={handleBidSubmit}>
            <div className={formGroupClass}>
              <label className={labelClass}>Select Tender:</label>
              <select className={selectClass} value={bidTenderId} onChange={handleBidTenderChange} required>
                <option value="">Select Tender</option>
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                ))}
              </select>
            </div>
            <div className={formGroupClass}>
              <label className={labelClass}>Bid Amount:</label>
              <input className={inputClass} type="number" value={bidAmount} onChange={handleBidAmountChange} required />
            </div>
            <div className={formGroupClass}>
              <label className={labelClass}>Notes/Description:</label>
              <input className={inputClass} type="text" value={bidNotes} onChange={handleBidNotesChange} />
            </div>
            <div className={formGroupClass}>
              <label className={labelClass}>Upload Bid Files:</label>
              <input className="text-sm text-slate-600" type="file" multiple onChange={handleBidFilesChange} />
            </div>
            <button type="submit" className={buttonPrimary}>Submit</button>
          </form>
          <h3 className="text-lg font-semibold text-slate-900">Submitted Bids</h3>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className={labelClass}>Filter by Tender:</label>
            <select className={selectClass} value={filterBidTender} onChange={(e) => setFilterBidTender(e.target.value)}>
              <option value="">All</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
              ))}
            </select>
            <label className={labelClass}>Amount:</label>
            <input className={inputClass} type="number" value={filterBidAmount} onChange={(e) => setFilterBidAmount(e.target.value)} placeholder="Any" />
            <label className={labelClass}>Status:</label>
            <select className={selectClass} value={filterBidStatus} onChange={(e) => setFilterBidStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Submitted">Submitted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className={tableWrap}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Bid ID</th>
                  <th className={thClass}>Tender</th>
                  <th className={thClass}>Amount</th>
                  <th className={thClass}>Notes</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Actions</th>
                  <th className={thClass}>Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid) => (
                  <tr key={bid.id}>
                    <td className={tdClass}>{bid.id}</td>
                    <td className={tdClass}>{bid.tenderId}</td>
                    <td className={tdClass}>
                      {editBidId === bid.id ? (
                        <input className={inputClass} type="number" value={editBidAmount} onChange={handleEditBidAmountChange} />
                      ) : (
                        bid.amount
                      )}
                    </td>
                    <td className={tdClass}>
                      {editBidId === bid.id ? (
                        <input className={inputClass} type="text" value={editBidNotes} onChange={handleEditBidNotesChange} />
                      ) : (
                        bid.notes
                      )}
                    </td>
                    <td className={tdClass}>{bid.status}</td>
                    <td className={tdClass}>
                      {editBidId === bid.id ? (
                        <span className="flex flex-wrap gap-2">
                          <button className={buttonPrimary} onClick={() => handleEditBidSave(bid.id)}>Save</button>
                          <button className={buttonGhost} onClick={() => setEditBidId(null)}>Cancel</button>
                        </span>
                      ) : (
                        <span className="flex flex-wrap gap-2">
                          <button className={buttonGhost} onClick={() => handleEditBid(bid)}>Edit</button>
                          <button className={buttonDanger} onClick={() => handleDeleteBid(bid.id)}>Delete</button>
                        </span>
                      )}
                    </td>
                    <td className={tdClass}><button className={buttonGhost} onClick={() => handleDownloadBid(bid)}>Download</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "uploadInvoices" && (
        <div className="space-y-6">
          <div className={cardClass}>
            <h2 className="mb-5 text-xl font-semibold text-slate-900">Upload Invoices</h2>
            <form className={formClass} onSubmit={handleInvoiceSubmit}>
              <div className={formGroupClass}>
                <label className={labelClass}>Select Purchase Order:</label>
                <select className={selectClass} value={invoicePo} onChange={handleInvoicePoChange} required>
                  <option value="">Select PO</option>
                  {issuedPOs.map((po) => (
                    <option key={po.id} value={po.id}>{po.id} (Tender: {po.tenderId})</option>
                  ))}
                </select>
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Invoice Name:</label>
                <input className={inputClass} type="text" value={invoiceName} onChange={e => setInvoiceName(e.target.value)} required />
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Invoice Amount:</label>
                <input className={inputClass} type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} required />
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Invoice File:</label>
                <input className="text-sm text-slate-600" type="file" onChange={handleInvoiceFileChange} required />
                <div className="text-xs text-slate-500">All file types accepted. Max: {MAX_FILE_SIZE_LABEL} per file.</div>
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Notes:</label>
                <textarea className={textareaClass} value={invoiceNotes} onChange={handleInvoiceNotesChange} />
              </div>
              <button type="submit" className={buttonPrimary}>Submit</button>
            </form>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Uploaded Invoices</h3>
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Invoice ID</th>
                    <th className={thClass}>PO</th>
                    <th className={thClass}>File</th>
                    <th className={thClass}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className={tdClass}>{inv.id}</td>
                      <td className={tdClass}>{inv.po}</td>
                      <td className={tdClass}>
                        {inv.fileUrl ? (
                          <a className="text-blue-600 underline" href={inv.fileUrl} target="_blank" rel="noreferrer">{inv.file || ''}</a>
                        ) : (
                          inv.file || ''
                        )}
                      </td>
                      <td className={tdClass}>{inv.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}

export default VendorDashboard;
