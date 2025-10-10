import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import { useNavigate } from "react-router-dom"; // For navigation



const BillingDashboard = () => {
  const [bills, setBills] = useState([]);
   const navigate = useNavigate();
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch ALL bills
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://vikasitha-back.onrender.com/api/bills");
        setBills(response.data);
        setFilteredBills(response.data);
      } catch (error) {
        console.error("Error fetching bills:", error);
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // Filter by memberId
  const handleSearchByMember = async () => {
    if (!memberId) {
      setFilteredBills(bills);
      return;
    }
    try {
      const response = await axios.get(
        `https://vikasitha-back.onrender.com/api/bills/member/${memberId}`
      );
      setFilteredBills(response.data);
    } catch (error) {
      console.error("Error fetching member bills:", error);
    }
  };

  // Filter by date range
  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setFilteredBills(bills);
      return;
    }
    const filtered = bills.filter((bill) => {
      const billDate = new Date(bill.meterReadingThisMonthDate);
      return billDate >= new Date(startDate) && billDate <= new Date(endDate);
    });
    setFilteredBills(filtered);
  };

  // Calculate income
  const calculateIncome = () => {
    return filteredBills.reduce(
      (sum, bill) => sum + (bill.thisMonthTotal || 0),
      0
    );
  };

  // Delete bill
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await axios.delete(`https://vikasitha-back.onrender.com/api/bills/${id}`);
        setBills(bills.filter((b) => b.id !== id));
        setFilteredBills(filteredBills.filter((b) => b.id !== id));
      } catch (error) {
        console.error("Error deleting bill:", error);
      }
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBills);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");
    XLSX.writeFile(workbook, "Billing_Report.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Billing Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [
        [
          "Member ID",
          "Date",
          "Meter Reading",
          "Remain",
          "Month Unit",
          "Unit Charge",
          "Fix Charge",
          "Total",
          "Status",
          "Remark",
        ],
      ],
      body: filteredBills.map((bill) => [
        bill.memberId,
        bill.meterReadingThisMonthDate,
        bill.meterReadingThisMonth,
        bill.meterReadingRemain,
        bill.monthUnit,
        bill.thisMonthCharge,
        bill.fixCharge,
        bill.thisMonthTotal,
        bill.status,
        bill.remark,
      ]),
    });
    doc.save("Billing_Report.pdf");
  };

  if (loading) return <p>Loading bills...</p>;

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
    <div className="billing-dashboard">
      <h2 className="form-title">Billing Details</h2>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by Member ID"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
        />
        <button onClick={handleSearchByMember}>Search</button>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleDateFilter}>Filter by Date</button>
      </div>

      {/* Income Summary */}
      <div className="summary">
        <h3>Total Income: Rs. {calculateIncome().toFixed(2)}</h3>
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button onClick={exportToExcel}>Download Excel</button>
        <button onClick={exportToPDF}>Download PDF</button>
      </div>


      {/* Billing Details Table (Read Only) */}
<div className="table-container">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Member ID</th>
            <th>Date</th>
            <th>Meter Reading</th>
            <th>Remaining Units</th>
            <th>Month Unit</th>
            <th>Unit Charge</th>
            <th>Fix Charge</th>
            <th>Total</th>

          </tr>
        </thead>
        <tbody>
          {filteredBills.map((bill) => (
            <tr key={bill.id}>
              <td>{bill.memberId}</td>
              <td>{bill.meterReadingThisMonthDate}</td>
              <td>{bill.meterReadingThisMonth}</td>
              <td>{bill.meterReadingRemain}</td>
              <td>{bill.monthUnit}</td>
              <td>{bill.thisMonthCharge}</td>
              <td>{bill.fixCharge}</td>
              <td>{bill.thisMonthTotal}</td>

            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
    </div>
  );
};

export default BillingDashboard;
