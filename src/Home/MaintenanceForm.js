import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaintenanceDashboard = () => {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [newMaintenance, setNewMaintenance] = useState({
    memberId: "",
    memberName: "",
    address: "",
    maintenanceName: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    doneBy: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    maintenanceId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch all maintenance records
  const fetchMaintenance = async () => {
    try {
      const res = await axios.get("https://vikasitha-back.onrender.com/api/maintenance");
      setMaintenanceList(res.data);
    } catch (err) {
      console.error("Error fetching maintenance:", err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaintenance((prev) => ({ ...prev, [name]: value }));
  };

  // Save or update maintenance
  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    try {
      if (editingMaintenance) {
        await axios.put(
          `https://vikasitha-back.onrender.com/api/maintenance/${editingMaintenance._id}`,
          newMaintenance
        );
        alert("Maintenance updated successfully!");
      } else {
        await axios.post(
          "https://vikasitha-back.onrender.com/api/maintenance",
          newMaintenance
        );
        alert("Maintenance added successfully!");
      }

      // Reset form
      setNewMaintenance({
        memberId: "",
        memberName: "",
        address: "",
        maintenanceName: "",
        cost: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        doneBy: "",
      });
      setEditingMaintenance(null);
      setModalOpen(false);
      fetchMaintenance();
    } catch (err) {
      console.error("Failed to save maintenance:", err);
      alert("Failed to save maintenance.");
    }
  };

  // Delete maintenance
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await axios.delete(`https://vikasitha-back.onrender.com/api/maintenance/${id}`);
      alert("Deleted successfully!");
      fetchMaintenance();
    } catch {
      alert("Failed to delete maintenance.");
    }
  };

  // Edit maintenance
  const handleEdit = (item) => {
    setEditingMaintenance(item);
    setNewMaintenance({
      memberId: item.memberId || "",
      memberName: item.memberName || "",
      address: item.address || "",
      maintenanceName: item.maintenanceName,
      cost: item.cost,
      date: item.date,
      description: item.description,
      doneBy: item.doneBy,
    });
    setModalOpen(true);
  };

  // Fetch payments for maintenance
  const fetchPayments = async (maintenanceId) => {
    try {
      const res = await axios.get(
        `https://vikasitha-back.onrender.com/api/maintenance-payments/maintenance/${maintenanceId}`
      );
      setPayments(res.data);
    } catch {
      setPayments([]);
    }
  };

  // Handle payment input
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://vikasitha-back.onrender.com/api/maintenance-payments", paymentForm);
      alert("Payment recorded!");
      fetchPayments(paymentForm.maintenanceId);
      setPaymentForm({
        maintenanceId: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowPaymentForm(false);
    } catch {
      alert("Failed to record payment.");
    }
  };

  // Filter maintenance by search
  const filteredMaintenance = maintenanceList.filter((m) =>
    [m.maintenanceName, m.doneBy, m.description, m.memberName, m.memberId]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Back Button */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="tariff-container">
        <h2 className="form-title">Maintenance Records</h2>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, member, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Add New */}
        <div className="form-actions1">
          <button className="btn-third" onClick={() => setModalOpen(true)}>
            + Add Maintenance
          </button>
        </div>

        {/* Maintenance Table */}
        <table className="payment-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Member Name</th>
              <th>Maintenance Name</th>
              <th>Cost</th>
              <th>Date</th>
              <th>Description</th>
              <th>Done By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaintenance.map((m) => (
              <tr key={m.id}>
                <td>{m.memberId}</td>
                <td>{m.memberName}</td>
                <td>{m.maintenanceName}</td>
                <td>{m.cost}</td>
                <td>{m.date}</td>
                <td>{m.description}</td>
                <td>{m.doneBy}</td>
                <td>
                  <button className="btn edit" onClick={() => handleEdit(m)}>Edit</button>
                  <button className="btn delete" onClick={() => handleDelete(m.id)}>Delete</button>
                  <button
                    className="btn third"
                    onClick={() => {
                      setPaymentForm({ ...paymentForm, maintenanceId: m._id });
                      fetchPayments(m._id);
                      setShowPaymentForm(true);
                    }}
                  >
                    Payments
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal for Add/Edit Maintenance */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  className="btn-back"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingMaintenance(null);
                  }}
                >
                  <ArrowLeft size={20} strokeWidth={2.5} /> Back
                </button>
                <h3>{editingMaintenance ? "Edit Maintenance" : "Add New Maintenance"}</h3>
              </div>

              <div className="modal-overlay">
                <div className="modal-content">
                  {/* Close button */}
                  <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>

                  <h3>{editingMaintenance ? "Edit Maintenance" : "Add New Maintenance"}</h3>

                  <form onSubmit={handleSaveMaintenance} className="maintenance-form">
                    {/* Row: Member ID + Member Name */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Member ID</label>
                        <input
                          type="text"
                          name="memberId"
                          value={newMaintenance.memberId}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Member Name</label>
                        <input
                          type="text"
                          name="memberName"
                          value={newMaintenance.memberName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Row: Address + Maintenance Name */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          name="address"
                          value={newMaintenance.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Maintenance Name</label>
                        <input
                          type="text"
                          name="maintenanceName"
                          value={newMaintenance.maintenanceName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Row: Cost + Date */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cost</label>
                        <input
                          type="number"
                          name="cost"
                          value={newMaintenance.cost}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          name="date"
                          value={newMaintenance.date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Row: Description + Done By */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          name="description"
                          value={newMaintenance.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Done By</label>
                        <input
                          type="text"
                          name="doneBy"
                          value={newMaintenance.doneBy}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        {editingMaintenance ? "Update" : "Add"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setModalOpen(false);
                          setEditingMaintenance(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Payment Form + History */}
        {showPaymentForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <button className="btn-back" onClick={() => setShowPaymentForm(false)}>
                  <ArrowLeft size={20} strokeWidth={2.5} /> Back
                </button>
                <h3>Add Payment</h3>
              </div>

              <form onSubmit={handleSavePayment} className="member-form">
                <div className="form-group">
                  <label>Amount Paid</label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={paymentForm.date}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save Payment</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowPaymentForm(false)}>Close</button>
                </div>
              </form>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="payment-history">
                  <h4>Payment History</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p._id}>
                          <td>{p.amount}</td>
                          <td>{p.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MaintenanceDashboard;
