import React, { useState } from "react";

// Dummy data for approved POs
const approvedPOs = [
  { id: "PO-1001", vendor: "Acme Supplies", amount: 1200, status: "Pending Payment" },
  { id: "PO-1002", vendor: "Tech World", amount: 850, status: "Paid" },
  { id: "PO-1003", vendor: "OfficeMart", amount: 500, status: "Pending Payment" },
];

const paymentMethods = [
  "Card",
  "Bank Transfer",
  "Mobile Payment"
];

const Payments = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [method, setMethod] = useState(paymentMethods[0]);

  const tableWrap = 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm';
  const tableClass = 'min-w-full text-sm';
  const thClass = 'bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
  const tdClass = 'border-t border-slate-100 px-4 py-3 text-slate-700';
  const buttonPrimary = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700';
  const buttonGhost = 'rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100';
  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100';

  const handlePayNow = (po) => {
    setSelectedPO(po);
    setShowModal(true);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setShowModal(false);
    alert("Payment successful!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
      <div className={tableWrap}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>PO ID</th>
              <th className={thClass}>Vendor</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {approvedPOs.map((po) => (
              <tr key={po.id}>
                <td className={tdClass}>{po.id}</td>
                <td className={tdClass}>{po.vendor}</td>
                <td className={tdClass}>{po.amount}</td>
                <td className={tdClass}>{po.status}</td>
                <td className={tdClass}>
                  {po.status === "Pending Payment" ? (
                    <button className={buttonPrimary} onClick={() => handlePayNow(po)}>
                      Pay Now
                    </button>
                  ) : (
                    <span className="text-emerald-600">Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedPO && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Make Payment for {selectedPO.id}</h3>
            <form className="mt-4 grid gap-4" onSubmit={handlePayment}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Payment Method</label>
                <select className={inputClass} value={method} onChange={e => setMethod(e.target.value)} required>
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Amount</label>
                <input className={`${inputClass} bg-slate-100 text-slate-500`} type="number" value={selectedPO.amount} readOnly />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className={buttonPrimary}>Confirm Payment</button>
                <button type="button" className={buttonGhost} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
