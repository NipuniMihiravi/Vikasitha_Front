import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegistrationDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    memberId: "",
    name: "",
    address: "",
    phoneNumber: "",
    landNo: "",
    nationalId: "",
    status: "Active", // New field
  });

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8081/api/registrations");
      setRegistrations(res.data);
    } catch (err) {
      console.error("Error fetching registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await axios.put(
          `http://localhost:8081/api/registrations/${editingMember.id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:8081/api/registrations", formData);
      }
      setModalOpen(false);
      setEditingMember(null);
      setFormData({
        memberId: "",
        name: "",
        address: "",
        phoneNumber: "",
        landNo: "",
        nationalId: "",
        status: "Active",
      });
      fetchRegistrations();
    } catch (err) {
      console.error("Error saving member:", err);
    }
  };

  // Delete member
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await axios.delete(`http://localhost:8081/api/registrations/${id}`);
        fetchRegistrations();
      } catch (err) {
        console.error("Error deleting member:", err);
      }
    }
  };

  // Edit member
  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      memberId: member.memberId,
      name: member.name,
      address: member.address,
      phoneNumber: member.phoneNumber,
      landNo: member.landNo,
      nationalId: member.nationalId,
      status: member.status || "Active",
    });
    setModalOpen(true);
  };

  // Filter by search
  const filteredMembers = registrations.filter((m) =>
    [m.memberId, m.name, m.phoneNumber, m.nationalId]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  // Count Active/Inactive
  const activeCount = registrations.filter((m) => m.status === "Active").length;
  const inactiveCount = registrations.filter((m) => m.status === "Inactive").length;

  return (
    <div>
      {/* Back Button */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="tariff-container">
        <h2 className="form-title">Member Registrations</h2>

        {/* Stats */}
        <div className="stats-bar">
          <p>Total Active: <b>{activeCount}</b></p>
          <p>Total Inactive: <b>{inactiveCount}</b></p>
        </div>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by ID, Name, Phone, National ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Add New */}
        <div className="form-actions1">
          <button className="btn-third" onClick={() => setModalOpen(true)}>
            + Add New Member
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Land No</th>
                <th>National ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.memberId}</td>
                  <td>{member.name}</td>
                  <td>{member.address}</td>
                  <td>{member.phoneNumber}</td>
                  <td>{member.landNo}</td>
                  <td>{member.nationalId}</td>
                  <td>
                    <span className={member.status === "Active" ? "status-active" : "status-inactive"}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(member)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(member.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  className="btn-back"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingMember(null);
                  }}
                >
                  <ArrowLeft size={20} strokeWidth={2.5} /> Back
                </button>
                <h3>{editingMember ? "Edit Member" : "Add New Member"}</h3>
              </div>

              <form onSubmit={handleSubmit} className="member-form">
                <div className="form-group">
                  <label>Member ID</label>
                  <input
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Land No</label>
                  <input
                    type="text"
                    name="landNo"
                    value={formData.landNo}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>National ID</label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingMember ? "Update" : "Add Member"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setModalOpen(false);
                      setEditingMember(null);
                    }}
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

export default RegistrationDashboard;
