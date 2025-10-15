import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinanceSummary = () => {
  const navigate = useNavigate();

  // Data states
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [maintenancePayments, setMaintenancePayments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Filter states
  const [filterMonth, setFilterMonth] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes, mRes, mpRes, eRes] = await Promise.all([
          axios.get("https://vikasitha-back.onrender.com/api/bills"),
          axios.get("https://vikasitha-back.onrender.com/api/payments"),
          axios.get("https://vikasitha-back.onrender.com/api/maintenance"),
          axios.get("https://vikasitha-back.onrender.com/api/maintenance-payments"),
          axios.get("https://vikasitha-back.onrender.com/api/expenses"),
        ]);

        setBills(bRes.data || []);
        setPayments(pRes.data || []);
        setMaintenance(mRes.data || []);
        setMaintenancePayments(mpRes.data || []);
        setExpenses(eRes.data || []);
      } catch (err) {
        console.error("Error fetching finance data:", err);
      }
    };

    fetchData();
  }, []);

  // Helper to filter by date
  const filterByDate = (arr, dateField) =>
    arr.filter((item) => {
      const d = new Date(item[dateField]);
      const yearMatch = !filterYear || d.getFullYear() === Number(filterYear);

      let monthMatch = true;
      if (filterMonth) monthMatch = d.getMonth() + 1 === Number(filterMonth);

      let quarterMatch = true;
      if (filterQuarter) {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        quarterMatch = q === Number(filterQuarter);
      }

      return yearMatch && monthMatch && quarterMatch;
    });

  // Compute monthly/quarter/year summary
  const getSummary = () => {
    const billsMonth = filterByDate(bills, "meterReadingThisMonthDate");
    const paymentsMonth = filterByDate(payments, "paymentDate");
    const maintenanceMonth = filterByDate(maintenance, "date");
    const maintenancePaymentsMonth = filterByDate(maintenancePayments, "date");
    const expensesMonth = filterByDate(expenses, "date");

    const totalBills = billsMonth.reduce((sum, b) => sum + (b.thisMonthTotal || 0), 0);
    const totalBillPayments = paymentsMonth.reduce((sum, p) => sum + (p.payment || 0), 0);
    const totalMaintenance = maintenanceMonth.reduce((sum, m) => sum + (m.cost || 0), 0);
    const totalMaintenancePayments = maintenancePaymentsMonth.reduce(
      (sum, mp) => sum + (mp.amount || 0),
      0
    );
    const totalExpenses = expensesMonth.reduce((sum, ex) => sum + (ex.amount || 0), 0);

    return { totalBills, totalBillPayments, totalMaintenance, totalMaintenancePayments, totalExpenses };
  };

  const summary = getSummary();

  // Convert month number to name
  const monthName = (num) => {
    if (!num) return "";
    return new Date(2000, num - 1).toLocaleString("default", { month: "long" });
  };

  return (
    <div>
      {/* Top bar */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="billing-dashboard">
        <h2 className="form-title">Finance Summary</h2>

        {/* Filters */}
        <div className="filters">
          <input
            type="number"
            placeholder="Year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          />
          <input
            type="number"
            placeholder="Month (1-12)"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
          <input
            type="number"
            placeholder="Quarter (1-4)"
            value={filterQuarter}
            onChange={(e) => setFilterQuarter(e.target.value)}
          />
        </div>

        {/* Summary Table */}
        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Bills {filterMonth && `(${monthName(filterMonth)})`}</td>
                <td>{summary.totalBills}</td>
              </tr>
              <tr>
                <td>Total Bill Payments</td>
                <td>{summary.totalBillPayments}</td>
              </tr>
              <tr>
                <td>Total Maintenance Cost</td>
                <td>{summary.totalMaintenance}</td>
              </tr>
              <tr>
                <td>Total Maintenance Payments</td>
                <td>{summary.totalMaintenancePayments}</td>
              </tr>
              <tr>
                <td>Total Expenses</td>
                <td>{summary.totalExpenses}</td>
              </tr>
              <tr>
                <td><b>Net Balance</b></td>
                <td>
                  <b>
                    {summary.totalBillPayments +
                      summary.totalMaintenancePayments -
                      summary.totalBills -
                      summary.totalMaintenance -
                      summary.totalExpenses}
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary;
