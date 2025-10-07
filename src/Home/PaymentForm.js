import React, { useState } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import { useNavigate } from "react-router-dom"; // For navigation

const PaymentForm = () => {
  // utility to get today's date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };
   const navigate = useNavigate();

  const [payment, setPayment] = useState({
    memberId: "",
    name: "",
    paymentDate: getTodayDate(), // ✅ now works
    payment: "",
  });

  const [loading, setLoading] = useState(false);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  // fetch member details when memberId field loses focus
  const handleMemberIdBlur = async () => {
    if (!payment.memberId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://vikasitha-back.onrender.com/api/registrations/member/${payment.memberId}`
      );

      if (response.data) {
        setPayment((prev) => ({
          ...prev,
          name: response.data.name, // auto-fill name
        }));
      } else {
        alert("No member found with this ID");
        setPayment((prev) => ({ ...prev, name: "" }));
      }
    } catch (error) {
      console.error("Error fetching member:", error);
      alert("Error fetching member details");
      setPayment((prev) => ({ ...prev, name: "" }));
    } finally {
      setLoading(false);
    }
  };

  // submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://vikasitha-back.onrender.com/api/payments", payment);
      alert("Payment saved successfully!");
      setPayment({
        memberId: "",
        name: "",
        paymentDate: getTodayDate(), // reset to today again
        payment: "",
      });
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Failed to save payment.");
    }
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
      <h2 className="form-title">Enter Payment</h2>

      <form onSubmit={handleSubmit} className="member-form">
        <div className="form-group">
          <label>Member ID:</label>
          <input
            type="text"
            name="memberId"
            value={payment.memberId}
            onChange={handleChange}
            onBlur={handleMemberIdBlur} // fetch member name when leaving field
            required
          />
        </div>

        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={payment.name} readOnly />
        </div>

        <div className="form-group">
          <label>Payment Date:</label>
          <input
            type="date"
            name="paymentDate"
            value={payment.paymentDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Payment Amount:</label>
          <input
            type="number"
            name="payment"
            value={payment.payment}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
        <button type="submit" className="btn-primary"  disabled={loading}>
          {loading ? "Saving..." : "Save Payment"}
        </button>
        </div>
      </form>
    </div>
    </div>

  );
};

export default PaymentForm;
