import React, { useState } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaintenanceForm = () => {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    memberId: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    memberId: "",
    memberName: "",
    address: "",
    maintenanceName: "",
    cost: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    doneBy: "",
  });

  // ✅ Fetch Member Details
  const fetchMemberDetails = async () => {
    try {
      const res = await axios.get(
        `https://vikasitha-back.onrender.com/api/registrations/member/${memberId}`
      );
      setMemberDetails(res.data);
      fetchMaintenance();
    } catch {
      alert("Member not found!");
      setMemberDetails(null);
      setMaintenanceList([]);
    }
  };

  // ✅ Fetch Maintenance + Payments
  const fetchMaintenance = async () => {
    try {
      const res = await axios.get(
        `https://vikasitha-back.onrender.com/api/maintenance/member/${memberId}`
      );
      const data = Array.isArray(res.data) ? res.data : [res.data];

      // Fetch related payments
      const withPayments = await Promise.all(
        data.map(async (m) => {
          try {
            const payRes = await axios.get(
              `https://vikasitha-back.onrender.com/api/maintenance-payments/maintenance/${memberId}`
            );
            const paymentList = Array.isArray(payRes.data)
              ? payRes.data
              : [payRes.data];

            const totalPaid = paymentList.reduce(
              (sum, p) => sum + Number(p.amount || 0),
              0
            );

            return {
              ...m,
              payments: paymentList,
              totalPaid,
            };
          } catch {
            return { ...m, payments: [], totalPaid: 0 };
          }
        })
      );

      setMaintenanceList(withPayments);
    } catch {
      setMaintenanceList([]);
    }
  };

  // ✅ Handle Input Changes
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save Payment
  const handleSavePayment = async (e) => {
    e.preventDefault();

    if (!memberId) {
      alert("Please enter member ID first!");
      return;
    }

    try {
      await axios.post(
        "https://vikasitha-back.onrender.com/api/maintenance-payments",
        {
          memberId,
          amount: paymentForm.amount,
          date: paymentForm.date,
        }
      );
      alert("Payment recorded!");
      fetchMaintenance(); // Refresh data
      setPaymentForm({
        memberId: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to record payment.");
    }
  };

  const handleMaintenanceInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaintenance((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveMaintenance = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://vikasitha-back.onrender.com/api/maintenance",
        newMaintenance
      );
      alert("New maintenance added!");
      fetchMaintenance(); // Refresh list
      setMaintenanceModalOpen(false);
      // Reset form
      setNewMaintenance({
        memberId: memberId || "",
        memberName: memberDetails?.name || "",
        address: memberDetails?.address || "",
        maintenanceName: "",
        cost: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
        doneBy: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add maintenance.");
    }
  };


  return (
    <div>
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} />
          Back
        </button>
      </div>

      <div className="form-container">
        <h2 className="form-title">Maintenance Records</h2>

        {/* Fetch Member */}
        <div className="member-form">
          <div className="form-group">
            <label>Member ID:</label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <div className="form-actions">
              <button onClick={fetchMemberDetails} className="btn-primary">
                Fetch Member
              </button>
            </div>
          </div>
        </div>

        {/* Member Info */}
        {memberDetails && (
          <div className="member-details">
            <h3 className="member-title">Member Details</h3>
            <div className="member-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{memberDetails.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">{memberDetails.address}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">
                  {memberDetails.phoneNumber}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + Add Payment
          </button>
          <button
            className="btn-primary"
            onClick={() => setMaintenanceModalOpen(true)}
          >
            + Add Maintenance
          </button>

        </div>

        {/* ✅ Maintenance & Payment Table */}
        {maintenanceList.length > 0 && (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Total Paid</th>
                <th>Remaining</th>
                <th>Date</th>
                <th>Description</th>
                <th>Done By</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceList.map((m) => {
                const remaining = m.cost - (m.totalPaid || 0);
                return (
                  <React.Fragment key={m._id}>
                    <tr>
                      <td>{m.maintenanceName}</td>
                      <td>{m.cost}</td>
                      <td>{m.totalPaid}</td>
                      <td>{remaining}</td>
                      <td>{m.date}</td>
                      <td>{m.description}</td>
                      <td>{m.doneBy}</td>
                    </tr>

                    {/* ✅ Show payment rows below */}
                    {m.payments.map((p, i) => (
                      <tr key={p._id || i} className="payment-row">
                        <td>Payment</td>
                        <td>-</td>
                        <td>{p.amount}</td>
                        <td>-</td>
                        <td>{p.date}</td>
                        <td colSpan="2">—</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}

        {/* ✅ Payment Modal */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add Payment</h3>
              </div>
              <div className="payment-form">
                <form onSubmit={handleSavePayment} className="member-form">
                  <div className="form-group">
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount Paid"
                      value={paymentForm.amount}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="date"
                      name="date"
                      value={paymentForm.date}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Save Payment
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Maintenance Modal */}
        {maintenanceModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">

                <h3>Add New Maintenance</h3>
              </div>

              <form onSubmit={handleSaveMaintenance} className="maintenance-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Member ID</label>
                    <input
                      type="text"
                      name="memberId"
                      value={newMaintenance.memberId}
                      onChange={handleMaintenanceInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Member Name</label>
                    <input
                      type="text"
                      name="memberName"
                      value={newMaintenance.memberName}
                      onChange={handleMaintenanceInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={newMaintenance.address}
                      onChange={handleMaintenanceInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Maintenance Name</label>
                    <input
                      type="text"
                      name="maintenanceName"
                      value={newMaintenance.maintenanceName}
                      onChange={handleMaintenanceInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cost</label>
                    <input
                      type="number"
                      name="cost"
                      value={newMaintenance.cost}
                      onChange={handleMaintenanceInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={newMaintenance.date}
                      onChange={handleMaintenanceInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      name="description"
                      value={newMaintenance.description}
                      onChange={handleMaintenanceInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Done By</label>
                    <input
                      type="text"
                      name="doneBy"
                      value={newMaintenance.doneBy}
                      onChange={handleMaintenanceInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMaintenanceModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MaintenanceForm;
