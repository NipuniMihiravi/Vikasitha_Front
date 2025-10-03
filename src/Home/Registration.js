import React, { useState } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memberId: "",
    name: "",
    address: "",
    phoneNumber: "",
    landNo: "",
    nationalId: "",
    status: "Active",   // ✅ default status
    remark: "",         // ✅ new remark field
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8081/api/registrations", formData);
      console.log(res.data);

      setMessage("Registration successful!");
      setFormData({
        memberId: "",
        name: "",
        address: "",
        phoneNumber: "",
        landNo: "",
        nationalId: "",
        status: "Active",
        remark: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
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
        <h2 className="form-title">Member Registration</h2>

        {message && (
          <p className={message.includes("successful") ? "success-msg" : "error-msg"}>
            {message}
          </p>
        )}

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
            <textarea
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

          {/* ✅ New Status Select */}
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Deactive">Deactive</option>
            </select>
          </div>

          {/* ✅ New Remark Field */}
          <div className="form-group">
            <label>Remark</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Enter any remarks..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setFormData({
                  memberId: "",
                  name: "",
                  address: "",
                  phoneNumber: "",
                  landNo: "",
                  nationalId: "",
                  status: "Active",
                  remark: "",
                })
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
