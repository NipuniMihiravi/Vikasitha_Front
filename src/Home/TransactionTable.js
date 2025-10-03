import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import { useNavigate } from "react-router-dom"; // For navigation
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const TransactionsTable = () => {
  const [memberId, setMemberId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch transactions function
  const fetchTransactions = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");

      // Fetch bills
      const billsRes = await axios.get(`http://localhost:8081/api/bills/member/${id}`);
      // Fetch payments
      const paymentsRes = await axios.get(`http://localhost:8081/api/payments/member/${id}`);

      const bills = billsRes.data.map((bill) => ({
        id: `bill-${bill.id}`,
        date: bill.meterReadingThisMonthDate,
        description: "Monthly Bill",
        debit: bill.thisMonthTotal,
        credit: 0,
        memberId: bill.memberId,
        meterReadingThisMonth: bill.meterReadingThisMonth,
        meterReadingRemain: bill.meterReadingRemain,
        monthUnit: bill.monthUnit,
        unit: bill.unit,
        fixCharge: bill.fixCharge,
        lateFee: 0, // default no late fee
      }));

      const payments = paymentsRes.data.map((pmt) => ({
        id: `pmt-${pmt.id}`,
        date: pmt.paymentDate,
        description: "Payment",
        debit: 0,
        credit: pmt.payment,
        memberId: pmt.memberId,
        meterReadingThisMonth: "-",
        meterReadingRemain: "-",
        monthUnit: "-",
        unit: "-",
        fixCharge: "-",
        lateFee: 0, // payments have no late fee
      }));

      let merged = [...bills, ...payments].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Running balance
      let balance = 0;
      let withBalance = merged.map((item) => {
        balance += item.debit - item.credit;
        return { ...item, balance };
      });

      // ✅ Late Fee Logic
      const latestBill = bills[bills.length - 1]; // last bill
      if (latestBill) {
        const billDate = new Date(latestBill.date);
        const today = new Date();
        const diffInDays = Math.floor((today - billDate) / (1000 * 60 * 60 * 24));

        // Find balance as of today
        const currentBalance = withBalance[withBalance.length - 1].balance;

        if (diffInDays > 30 && currentBalance > 0) {
          const lateFee = currentBalance * 0.05;

          const lateFeeTxn = {
            id: `latefee-${latestBill.id}`,
            date: today.toISOString().split("T")[0],
            description: "Late Payment", // ✅ as requested
            debit: lateFee,
            credit: 0,
            memberId: latestBill.memberId,
            meterReadingThisMonth: "-",
            meterReadingRemain: "-",
            monthUnit: "-",
            unit: "-",
            fixCharge: "-",
            lateFee: lateFee, // ✅ new field
            balance: currentBalance + lateFee,
          };

          withBalance = [...withBalance, lateFeeTxn];
        }
      }

      setTransactions(withBalance);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions for this Member ID.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(memberId.trim());
  };

  // ✅ Export to Excel
    const exportToExcel = () => {
      if (transactions.length === 0) return;
      const ws = XLSX.utils.json_to_sheet(transactions);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `transactions_${memberId}.xlsx`);
    };

    // ✅ Export to PDF
    const exportToPDF = () => {
      if (transactions.length === 0) return;
      const doc = new jsPDF();
      doc.text("Transactions Report", 14, 15);

      const tableColumn = [
        "Date",
        "Description",
        "Member ID",
        "Meter Reading",
        "Remaining Units",
        "Month Unit",
        "Total Unit",
        "Fix Charge",
        "Debit",
        "Credit",
        "Balance",

      ];

      const tableRows = transactions.map((t) => [
        t.date,
        t.description,
        t.memberId,
        t.meterReadingThisMonth,
        t.meterReadingRemain,
        t.monthUnit,
        t.unit,
        t.fixCharge,
        t.debit.toFixed(2),
        t.credit.toFixed(2),
        t.balance.toFixed(2),
        t.lateFee ? t.lateFee.toFixed(2) : "-",
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`transactions_${memberId}.pdf`);
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

       <div className="billing-dashboard">


      <h2 className="form-title">Search Transactions by Member ID</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: "15px" }}>
      <div className="filters">
        <input
          type="text"
          placeholder="Enter Member ID"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        />
        <button type="submit">Search</button>
        </div>
      </form>


      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && transactions.length === 0 && !error && <p>No transactions found.</p>}

       <div className="export-buttons">
              <button onClick={exportToExcel}>Download Excel</button>
              <button onClick={exportToPDF}>Download PDF</button>
            </div>

      {transactions.length > 0 && (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Member ID</th>
              <th>Meter Reading</th>
              <th>Remaining Units</th>
              <th>Month Unit</th>
              <th>Total Unit</th>
              <th>Fix Charge</th>
              <th>Debit (Bill / Late Fee)</th>
              <th>Credit (Payment)</th>
              <th>Balance</th>

            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <td>{t.memberId}</td>
                <td>{t.meterReadingThisMonth}</td>
                <td>{t.meterReadingRemain}</td>
                <td>{t.monthUnit}</td>
                <td>{t.unit}</td>
                <td>{t.fixCharge}</td>
                <td>{t.debit.toFixed(2)}</td>
                <td>{t.credit.toFixed(2)}</td>
                <td>{t.balance.toFixed(2)}</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};

export default TransactionsTable;
