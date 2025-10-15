import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AppHome.css";

const MaintenancePaymentsDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const [paymentForm, setPaymentForm] = useState({
    memberId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // ✅ Fetch all payments from backend
  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        "https://vikasitha-back.onrender.com/api/maintenance-payments"
      );
      console.log("Fetched Payments:", res.data); // Debug: check keys
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ✅ Handle input change for Edit
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save edited payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;
    try {
      await axios.put(
        `https://vikasitha-back.onrender.com/api/maintenance-payments/${editingPayment.id || editingPayment._id}`,
        paymentForm
      );
      alert("Payment updated successfully!");
      setEditingPayment(null);
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment.");
    }
  };

  // ✅ Edit payment
  const handleEdit = (p) => {
    setEditingPayment(p);
    setPaymentForm({
      memberId: p.memberId,
      amount: p.amount,
      date: p.date,
    });
    setModalOpen(true);
  };

  // ✅ Delete payment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await axios.delete(
        `https://vikasitha-back.onrender.com/api/maintenance-payments/${id}`
      );
      alert("Deleted successfully!");
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete payment.");
    }
  };

  return (
    <div>
      {/* 🔙 Back Button */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="tariff-container">
        <h2 className="form-title">Maintenance Payments</h2>

        {/* 📋 Payments Table */}
        <table className="payment-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id || p._id}>
                <td>{p.memberId}</td>
                <td>{p.amount}</td>
                <td>{p.date}</td>
                <td>
                  <button className="btn edit" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn delete" onClick={() => handleDelete(p.id || p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🧾 Modal for Edit Payment */}
        {modalOpen && editingPayment && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
              <h3>Edit Payment</h3>
              <form onSubmit={handleSavePayment} className="maintenance-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Member ID</label>
                    <input
                      type="text"
                      name="memberId"
                      value={paymentForm.memberId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentForm.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={paymentForm.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Update</button>
                  <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePaymentsDashboard;
