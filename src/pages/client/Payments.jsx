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
    <div className="sv-payments-section">
      <h2>Payments</h2>
      <table className="sv-table sv-table-striped sv-table-rounded">
        <thead>
          <tr>
            <th>PO ID</th>
            <th>Vendor</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {approvedPOs.map((po) => (
            <tr key={po.id}>
              <td>{po.id}</td>
              <td>{po.vendor}</td>
              <td>{po.amount}</td>
              <td>{po.status}</td>
              <td>
                {po.status === "Pending Payment" ? (
                  <button className="sv-btn-primary" onClick={() => handlePayNow(po)}>
                    Pay Now
                  </button>
                ) : (
                  <span style={{ color: "green" }}>Paid</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedPO && (
        <div className="sv-modal sv-modal-open">
          <div className="sv-modal-content">
            <h3>Make Payment for {selectedPO.id}</h3>
            <form onSubmit={handlePayment}>
              <div className="sv-form-group">
                <label>Payment Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} required>
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="sv-form-group">
                <label>Amount</label>
                <input type="number" value={selectedPO.amount} readOnly />
              </div>
              <button type="submit" className="sv-btn-primary">Confirm Payment</button>
              <button type="button" className="sv-btn-secondary" onClick={() => setShowModal(false)} style={{marginLeft:8}}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
