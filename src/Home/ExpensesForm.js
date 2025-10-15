import React, { useState } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ExpenseForm = () => {
  const navigate = useNavigate();

  // ✅ Get today’s date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // ✅ Form state
  const [expense, setExpense] = useState({
    expenseName: "",
    amount: "",
    date: getTodayDate(),
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.post("https://vikasitha-back.onrender.com/api/expenses", expense);
      alert("Expense added successfully!");

      // Reset form after save
      setExpense({
        expenseName: "",
        amount: "",
        date: getTodayDate(),
        description: "",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Back button */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} />
          Back
        </button>
      </div>

      {/* Form section */}
      <div className="form-container">
        <h2 className="form-title">Add Expense</h2>

        <form onSubmit={handleSubmit} className="member-form">
          {/* Expense Name (Select) */}
          <div className="form-group">
            <label>Expense Name:</label>
            <select
              name="expenseName"
              value={expense.expenseName}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Expense Name --</option>
              <option value="Water Bill">Water Bill</option>
              <option value="Electricity">Electricity</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Stationery">Stationery</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>Amount (Rs):</label>
            <input
              type="number"
              name="amount"
              value={expense.amount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={expense.description}
              onChange={handleChange}
              placeholder="Enter short description"
              rows="3"
            ></textarea>
          </div>

          {/* Submit button */}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
