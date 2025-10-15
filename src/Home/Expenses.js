import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AppHome.css";

const Expenses = () => {
  const navigate = useNavigate();

  const [expenseNames, setExpenseNames] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    expenseName: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Fetch data
  useEffect(() => {
    fetchExpenseNames();
    fetchExpenses();
  }, []);

  const fetchExpenseNames = async () => {
    try {
      const res = await axios.get("https://vikasitha-back.onrender.com/api/expense-names");
      setExpenseNames(res.data);
    } catch (err) {
      console.error("Error fetching expense names:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("https://vikasitha-back.onrender.com/api/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  // Add new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://vikasitha-back.onrender.com/api/expenses", expenseForm);
      alert("Expense added successfully!");
      setExpenseForm({
        expenseName: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`https://vikasitha-back.onrender.com/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // Manage Expense Name
  const handleAddExpenseName = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://vikasitha-back.onrender.com/api/expense-names", {
        name: newExpenseName,
      });
      setNewExpenseName("");
      fetchExpenseNames();
    } catch (err) {
      console.error("Error adding expense name:", err);
    }
  };

  const handleDeleteExpenseName = async (id) => {
    if (!window.confirm("Delete this expense name?")) return;
    try {
      await axios.delete(`https://vikasitha-back.onrender.com/api/expense-names/${id}`);
      fetchExpenseNames();
    } catch (err) {
      console.error("Error deleting expense name:", err);
    }
  };

  // 🔍 Filter expenses by search & date range
  const filteredExpenses = expenses.filter((exp) => {
    const matchSearch =
      [exp.expenseName, exp.description, exp.date]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchStart =
      !dateFilter.startDate || new Date(exp.date) >= new Date(dateFilter.startDate);
    const matchEnd =
      !dateFilter.endDate || new Date(exp.date) <= new Date(dateFilter.endDate);

    return matchSearch && matchStart && matchEnd;
  });

  return (
    <div>
      {/* Top Bar */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="tariff-container">
        <h2 className="form-title">Expenses Management</h2>

        {/* Search and Filter */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />




          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, startDate: e.target.value })
            }
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, endDate: e.target.value })
            }
          />
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + Add Expense
          </button>
          <button className="btn-primary" onClick={() => setNameModalOpen(true)}>
            Manage Expense Names
          </button>
        </div>

        {/* Expenses Table */}
        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Expense Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{exp.expenseName}</td>
                    <td>{exp.amount}</td>
                    <td>{exp.date}</td>
                    <td>{exp.description}</td>
                    <td>
                      <button
                        className="btn delete"
                        onClick={() => handleDeleteExpense(exp._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No expenses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Expense Add Modal */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <button className="btn-back" onClick={() => setModalOpen(false)}>
                  <ArrowLeft size={20} strokeWidth={2.5} /> Back
                </button>
                <h3>Add New Expense</h3>
              </div>

              <form onSubmit={handleAddExpense} className="member-form">
                <div className="form-group">
                  <label>Expense Name</label>
                  <select
                    name="expenseName"
                    value={expenseForm.expenseName}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        expenseName: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Expense Name</option>
                    {expenseNames.map((en) => (
                      <option key={en._id} value={en.name}>
                        {en.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expense Name Modal */}
        {nameModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  className="btn-back"
                  onClick={() => setNameModalOpen(false)}
                >
                  <ArrowLeft size={20} strokeWidth={2.5} /> Back
                </button>
                <h3>Manage Expense Names</h3>
              </div>

              <form onSubmit={handleAddExpenseName} className="member-form">
                <div className="form-group">
                  <label>New Expense Name</label>
                  <input
                    type="text"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Add Name
                  </button>
                </div>
              </form>

              <table>
                <thead>
                  <tr>
                    <th>Expense Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseNames.map((en) => (
                    <tr key={en._id}>
                      <td>{en.name}</td>
                      <td>
                        <button
                          className="btn delete"
                          onClick={() => handleDeleteExpenseName(en._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
