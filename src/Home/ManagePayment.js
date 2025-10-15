import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Admin.css";

const PaymentTable = ({ memberId }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const navigate = useNavigate();

  // Fetch payments
  useEffect(() => {
    fetchPayments();
  }, [memberId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let url = "https://vikasitha-back.onrender.com/api/payments";
      if (memberId) {
        url = `https://vikasitha-back.onrender.com/api/payments/member/${memberId}`;
      }
      const response = await axios.get(url);
      setPayments(response.data);
      setFilteredPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await axios.delete(`https://vikasitha-back.onrender.com/api/payments/${id}`);
      setPayments(payments.filter((p) => p.id !== id));
      setFilteredPayments(filteredPayments.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment.");
    }
  };

  // Filter logic
  const handleFilter = () => {
    let filtered = [...payments];

    if (searchId) {
      filtered = filtered.filter((pmt) =>
        pmt.memberId.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (pmt) => new Date(pmt.paymentDate) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (pmt) => new Date(pmt.paymentDate) <= new Date(dateTo)
      );
    }

    setFilteredPayments(filtered);
  };

  // Calculate total
  const totalPayments = filteredPayments.reduce(
    (sum, pmt) => sum + (pmt.payment || 0),
    0
  );

  // ✅ Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPayments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "Payments_Report.xlsx");
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Payments Report", 14, 15);
    doc.autoTable({
      startY: 25,
      head: [["Payment ID", "Member ID", "Name", "Date", "Amount"]],
      body: filteredPayments.map((pmt) => [
        pmt.id,
        pmt.memberId,
        pmt.name,
        pmt.paymentDate,
        pmt.payment,
      ]),
    });
    doc.save("Payments_Report.pdf");
  };

  if (loading) return <p>Loading payments...</p>;

  return (
    <div>
      {/* Top bar with back button */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} strokeWidth={3} />
          Back
        </button>
      </div>

      <div className="billing-dashboard">
        <h2 className="form-title">Payment Records</h2>

        {/* Search and filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by Member ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <button onClick={handleFilter}>Apply Filters</button>
        </div>

        {/* Total summary */}
        <div className="summary">
          <h3>Total Income: Rs. {totalPayments}</h3>
        </div>

        {/* Export Buttons */}
        <div className="export-buttons">
          <button onClick={exportToExcel}>Download Excel</button>
          <button onClick={exportToPDF}>Download PDF</button>
        </div>

        {/* Table */}
        {filteredPayments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <table className="payment-table">
            <thead>
              <tr>

                <th>Member ID</th>
                <th>Name</th>
                <th>Payment Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pmt) => (
                <tr key={pmt.id}>

                  <td>{pmt.memberId}</td>
                  <td>{pmt.name}</td>
                  <td>{pmt.paymentDate}</td>
                  <td>{pmt.payment}</td>
                  <td>
                   <td>
                     <button
                       className="btn delete"
                       onClick={() => handleDelete(pmt.id)}
                     >
                       Delete
                     </button>
                   </td>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentTable;
