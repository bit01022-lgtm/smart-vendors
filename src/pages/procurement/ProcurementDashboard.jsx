

import React, { useEffect, useState } from "react";

import MainLayout from '../../components/layout/MainLayout';
import HandleRequestsTab from './HandleRequestsTab';
import {
  saveProcurementTenders,
  saveProcurementBids,
  subscribeProcurementTenders,
  subscribeProcurementBids,
  uploadFiles,
} from '../../services/dataService';
import { logActivity } from '../../utils/activityLogger';

 

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
      async function handleSubmit(e) {
        e.preventDefault();

        let uploadedAttachments = [];
        if (form.attachments.length) {
          try {
            uploadedAttachments = await uploadFiles(form.attachments);
          } catch {
            showNotification('Unable to upload one or more attachments.');
            return;
          }
        }

        const nextTenders = [
          ...tenders,
          {
            id: getNextTenderId(),
            title: form.title,
            category: form.category,
            subcategory: form.subcategory,
            budget: { min: Number(form.budgetMin), max: Number(form.budgetMax) },
            deadline: form.deadline,
            status: "Open",
            attachments: uploadedAttachments.map((file) => ({
              name: file.originalName,
              fileName: file.fileName,
              fileUrl: file.fileUrl,
              size: file.size,
              type: file.contentType,
              uploadedAt: file.uploadedAt,
            })),
          },
        ];

        setTenders(nextTenders);

        try {
          await saveProcurementTenders(nextTenders);
        } catch {
          showNotification("Unable to save tender. Please try again.");
          return;
        }

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
        logActivity({
          type: 'Tender Created',
          reference: nextTenders[nextTenders.length - 1]?.id || 'TENDER',
          user: 'Procurement User',
          status: 'Open',
        }).catch(() => {});
        showNotification("Tender created.");
      }
      function handleSelectWinnerTender(e) {
        setWinnerTenderId(e.target.value);
      }
      function handleSelectWinner(bidId) {
        const tenderId = winnerTenderId;
        const updated = bids.map((bid) =>
          bid.tenderId === tenderId
            ? { ...bid, status: bid.id === bidId ? "Winner" : "Rejected" }
            : bid
        );

        setBids(updated);
        saveProcurementBids(updated).catch(() => {});
        logActivity({
          type: 'Winning Vendor Selected',
          reference: tenderId || 'TENDER',
          user: 'Procurement User',
          status: 'Winner Selected',
        }).catch(() => {});
        showNotification("Winner selected.");
      }
      function handlePoTenderChange(e) {
        const tenderId = e.target.value;
        setPoForm((prev) => ({ ...prev, tenderId, vendor: "", amount: "" }));
      }
      function handlePoVendorChange(e) {
        const vendor = e.target.value;
        const bid = bids.find(
          (b) => b.tenderId === poForm.tenderId && b.vendor === vendor
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
      async function handlePoSubmit(e) {
        e.preventDefault();
        const nextTenders = tenders.map((t) =>
          t.id === poForm.tenderId ? { ...t, status: "Closed" } : t
        );

        setTenders(nextTenders);
        try {
          await saveProcurementTenders(nextTenders);
        } catch {
          showNotification("Unable to update tender status. Please try again.");
          return;
        }

        setPurchaseOrders((prev) => [
          ...prev,
          {
            ...poForm,
            poNumber: getNextPoNumber(),
          },
        ]);
        setPoForm({
          tenderId: "",
          vendor: "",
          poNumber: "",
          issueDate: today,
          amount: "",
          notes: "",
        });
        logActivity({
          type: 'Purchase Order Issued',
          reference: poForm.tenderId || 'PO',
          user: 'Procurement User',
          status: 'Closed',
        }).catch(() => {});
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
  const [activeTab, setActiveTab] = useState("handleRequests");
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
  const buttonGreen = 'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700';
  const buttonGhost = 'rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100';
  const tableWrap = 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm';
  const tableClass = 'min-w-full text-sm';
  const thClass = 'bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
  const tdClass = 'border-t border-slate-100 px-4 py-3 text-slate-700';

  useEffect(() => {
    const unsubscribeTenders = subscribeProcurementTenders(setTenders, initialTenders);
    const unsubscribe = subscribeProcurementBids(setBids, initialBids);
    return () => {
      unsubscribeTenders();
      unsubscribe();
    };
  }, []);


  // --- Helper and handler functions moved above ---


  return (
    <MainLayout title="Procurement">
      <div className="space-y-6">
        {notification && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notification}</div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            className={`${tabBase} ${activeTab === 'handleRequests' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("handleRequests")}
          >Handle Requests</button>
          <button
            className={`${tabBase} ${activeTab === 'createTender' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("createTender")}
          >Create Tender</button>
          <button
            className={`${tabBase} ${activeTab === 'viewBids' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("viewBids")}
          >View Vendor Bids</button>
          <button
            className={`${tabBase} ${activeTab === 'selectWinner' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("selectWinner")}
          >Select Winning Vendor</button>
          <button
            className={`${tabBase} ${activeTab === 'issuePO' ? tabActive : tabInactive}`}
            onClick={() => setActiveTab("issuePO")}
          >Issue Purchase Order</button>
        </div>

        {activeTab === "handleRequests" && (
          <HandleRequestsTab />
        )}

        {activeTab === "createTender" && (
          <div className="space-y-6">
            <div className={cardClass}>
              <h2 className="mb-5 text-xl font-semibold text-slate-900">Create Tender</h2>
              <form className={formClass} onSubmit={handleSubmit}>
                <div className={formGroupClass}>
                  <label className={labelClass}>Tender Title</label>
                  <input className={inputClass} name="title" type="text" value={form.title} onChange={handleInputChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Description</label>
                  <textarea className={textareaClass} name="description" value={form.description} onChange={handleInputChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Category</label>
                  <select className={selectClass} name="category" value={form.category} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    {Object.keys(categoryOptions).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Subcategory</label>
                  <select className={selectClass} name="subcategory" value={form.subcategory} onChange={handleInputChange} required disabled={!form.category}>
                    <option value="">{form.category ? "Select Subcategory" : "Select Category First"}</option>
                    {form.category && categoryOptions[form.category].map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Budget Min</label>
                  <input className={inputClass} name="budgetMin" type="number" value={form.budgetMin} onChange={handleInputChange} min="0" required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Budget Max</label>
                  <input className={inputClass} name="budgetMax" type="number" value={form.budgetMax} onChange={handleInputChange} min={form.budgetMin || 0} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Submission Deadline</label>
                  <input className={inputClass} name="deadline" type="date" value={form.deadline} onChange={handleInputChange} min={today} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Attachments</label>
                  <input className="text-sm text-slate-600" name="attachments" type="file" onChange={handleInputChange} multiple />
                </div>
                <button type="submit" className={buttonPrimary}>Submit</button>
              </form>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">Active Tenders</h3>
              {tenders.filter(t => t.status === "Open").length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">No tenders available</div>
              ) : (
                <div className={tableWrap}>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>ID</th>
                        <th className={thClass}>Title</th>
                        <th className={thClass}>Category</th>
                        <th className={thClass}>Subcategory</th>
                        <th className={thClass}>Budget</th>
                        <th className={thClass}>Deadline</th>
                        <th className={thClass}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenders.filter(t => t.status === "Open").map((tender) => (
                        <tr key={tender.id}>
                          <td className={tdClass}>{tender.id}</td>
                          <td className={tdClass}>{tender.title}</td>
                          <td className={tdClass}>{tender.category}</td>
                          <td className={tdClass}>{tender.subcategory}</td>
                          <td className={tdClass}>{tender.budget.min} - {tender.budget.max}</td>
                          <td className={tdClass}>{tender.deadline}</td>
                          <td className={tdClass}>
                            <button className={`${buttonPrimary} mr-2`}>View Bids</button>
                            <button className={buttonGreen}>Select Winner</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">Closed Tenders</h3>
              {tenders.filter(t => t.status === "Closed").length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">No closed tenders</div>
              ) : (
                <div className={tableWrap}>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>ID</th>
                        <th className={thClass}>Title</th>
                        <th className={thClass}>Category</th>
                        <th className={thClass}>Subcategory</th>
                        <th className={thClass}>Budget</th>
                        <th className={thClass}>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenders.filter(t => t.status === "Closed").map((tender) => (
                        <tr key={tender.id}>
                          <td className={tdClass}>{tender.id}</td>
                          <td className={tdClass}>{tender.title}</td>
                          <td className={tdClass}>{tender.category}</td>
                          <td className={tdClass}>{tender.subcategory}</td>
                          <td className={tdClass}>{tender.budget.min} - {tender.budget.max}</td>
                          <td className={tdClass}>{tender.deadline}</td>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Vendor Bids</h3>
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Bid ID</th>
                    <th className={thClass}>Tender ID</th>
                    <th className={thClass}>Vendor Name</th>
                    <th className={thClass}>Bid Amount</th>
                    <th className={thClass}>Submission Date</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr key={bid.id}>
                      <td className={tdClass}>{bid.id}</td>
                      <td className={tdClass}>{bid.tenderId}</td>
                      <td className={tdClass}>{bid.vendor}</td>
                      <td className={tdClass}>{bid.amount}</td>
                      <td className={tdClass}>{bid.date}</td>
                      <td className={tdClass}>{bid.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "selectWinner" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Select Winning Vendor</h3>
            <div className={formGroupClass}>
              <label className={labelClass}>Select Tender:</label>
              <select className={selectClass} value={winnerTenderId} onChange={handleSelectWinnerTender}>
                <option value="">Select Tender</option>
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                ))}
              </select>
            </div>
            {winnerTenderId && (
              <>
                <div>
                  <button
                    className={buttonGreen}
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
                <div className={tableWrap}>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Bid ID</th>
                        <th className={thClass}>Vendor Name</th>
                        <th className={thClass}>Bid Amount</th>
                        <th className={thClass}>Status</th>
                        <th className={thClass}>Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bids.filter((b) => b.tenderId === winnerTenderId).map((bid) => (
                        <tr key={bid.id}>
                          <td className={tdClass}>{bid.id}</td>
                          <td className={tdClass}>{bid.vendor}</td>
                          <td className={tdClass}>{bid.amount}</td>
                          <td className={tdClass}>{bid.status}</td>
                          <td className={tdClass}>
                            <button className={buttonGhost} onClick={() => handleSelectWinner(bid.id)} disabled={bid.status === "Winner"}>Select</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "issuePO" && (
          <div className="space-y-6">
            <div className={cardClass}>
              <h2 className="mb-5 text-xl font-semibold text-slate-900">Issue Purchase Order</h2>
              <form className={formClass} onSubmit={handlePoSubmit}>
                <div className={formGroupClass}>
                  <label className={labelClass}>Select Tender:</label>
                  <select className={selectClass} name="tenderId" value={poForm.tenderId} onChange={handlePoTenderChange} required>
                    <option value="">Select Tender</option>
                    {tenders.filter((t) => t.status !== "Closed").map((t) => (
                      <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                    ))}
                  </select>
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Select Vendor:</label>
                  <select className={selectClass} name="vendor" value={poForm.vendor} onChange={handlePoVendorChange} required disabled={!poForm.tenderId}>
                    <option value="">Select Vendor</option>
                    {bids.filter((b) => b.tenderId === poForm.tenderId).length === 0 ? (
                      <option value="" disabled>No vendor bids for this tender</option>
                    ) : (
                      bids
                        .filter((b) => b.tenderId === poForm.tenderId)
                        .map((b) => (
                          <option key={b.id} value={b.vendor}>{b.vendor}</option>
                        ))
                    )}
                  </select>
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>PO Number:</label>
                  <input className={`${inputClass} bg-slate-100 text-slate-500`} name="poNumber" type="text" value={poForm.poNumber || getNextPoNumber()} readOnly />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Issue Date:</label>
                  <input className={inputClass} name="issueDate" type="date" value={poForm.issueDate} onChange={handlePoInputChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Amount:</label>
                  <input className={inputClass} name="amount" type="number" value={poForm.amount} onChange={handlePoInputChange} required />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Notes:</label>
                  <textarea className={textareaClass} name="notes" value={poForm.notes} onChange={handlePoInputChange} />
                </div>
                <button type="submit" className={buttonPrimary}>Submit</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default ProcurementDashboard;
