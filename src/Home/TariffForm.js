import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import { useNavigate } from "react-router-dom"; // For navigation
import "./AppHome.css";


const TariffManager = () => {
  const [tariff, setTariff] = useState({
    tariffDate: "",
    tariffName: "",
    minUnit: 0,
    maxUnit: 0,
    unitPrice: 0,
    fixCharge: 0,
    remark: "",
    status: "ACTIVE",
  });
  const [tariffs, setTariffs] = useState([]);
  const [editingTariff, setEditingTariff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTariffs = async () => {
    try {
      const res = await axios.get("https://vikasitha-back.onrender.com/api/tariff");
      setTariffs(res.data);
    } catch (err) {
      console.error("Error fetching tariffs:", err);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTariff({ ...tariff, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTariff) {
        await axios.put(`https://vikasitha-back.onrender.com/api/tariff/${editingTariff.id}`, tariff);
        setEditingTariff(null);
      } else {
        await axios.post( "https://vikasitha-back.onrender.com/api/tariff", tariff);
      }
      resetForm();
      fetchTariffs();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving tariff:", err);
      alert("Failed to save tariff!");
    }
  };

  const handleEdit = (tariff) => {
    setTariff({
      ...tariff,
      tariffDate: tariff.tariffDate?.split("T")[0] || "",
    });
    setEditingTariff(tariff);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tariff?")) return;
    try {
      await axios.delete(`http://localhost:8081/api/tariff/${id}`);
      fetchTariffs();
    } catch (err) {
      console.error("Error deleting tariff:", err);
    }
  };

  const resetForm = () => {
    setTariff({
      tariffDate: "",
      tariffName: "",
      minUnit: 0,
      maxUnit: 0,
      unitPrice: 0,
      fixCharge: 0,
      remark: "",
      status: "ACTIVE",
    });
    setEditingTariff(null);
  };

  return (
  <div>
     <div className="form-top-bar">
               <button
                     className="btn-back"
                     onClick={() => navigate(-1)}
                   >
                     <ArrowLeft size={24} strokeWidth={4} />
                     Back
                   </button>

              </div>
    <div className="form-container">

     <h2 className="form-title">Tariff List</h2>
      {/* Button to open modal */}

      <button className="btn-third" onClick={() => setIsModalOpen(true)}>
        + Add New Tariff
      </button>


      {/* Modal for Add/Edit */}
      <div className="modal-container">
      <Modal isOpen={isModalOpen} onClose={() => { resetForm(); setIsModalOpen(false); }}>
        <h2 className="form-title">{editingTariff ? "Edit Tariff" : "Add New Tariff"}</h2>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>Tariff Name</label>
            <input
              type="text"
              name="tariffName"
              value={tariff.tariffName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tariff Date</label>
            <input
              type="date"
              name="tariffDate"
              value={tariff.tariffDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Min Unit</label>
              <input
                type="number"
                name="minUnit"
                value={tariff.minUnit}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Max Unit</label>
              <input
                type="number"
                name="maxUnit"
                value={tariff.maxUnit}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Unit Price</label>
              <input
                type="number"
                step="0.01"
                name="unitPrice"
                value={tariff.unitPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Fixed Charge</label>
              <input
                type="number"
                step="0.01"
                name="fixCharge"
                value={tariff.fixCharge}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Remark</label>
            <textarea
              name="remark"
              value={tariff.remark}
              onChange={handleChange}
              required
              rows="4"
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={tariff.status} onChange={handleChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingTariff ? "Update" : "Add"} Tariff
            </button>
            <button type="button" onClick={() => { resetForm(); setIsModalOpen(false); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      </div>

      {/* Table */}

      <div className="table-container">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Unit Range</th>
              <th>Unit Price</th>
              <th>Fix Charge</th>
              <th>Remark</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tariffs.map((t) => (
              <tr key={t.id}>
                <td>{t.tariffName}</td>
                <td>{t.tariffDate?.split("T")[0]}</td>
                <td>{t.minUnit} - {t.maxUnit}</td>
                <td>{t.unitPrice.toFixed(2)}</td>
                <td>{t.fixCharge.toFixed(2)}</td>
                <td>{t.remark}</td>
                <td>{t.status}</td>
                <td>
                  <button className="btn edit" onClick={() => handleEdit(t)}>Edit</button>
                  <button className="btn delete" onClick={() => handleDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {tariffs.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>No Tariffs Found</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

    </div>
     </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default TariffManager;
