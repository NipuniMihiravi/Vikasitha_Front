import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const TransactionsTable = () => {
  const [memberId, setMemberId] = useState("");
  const [memberDetails, setMemberDetails] = useState(null); // ✅ new state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchTransactions = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");

      // Fetch member details
      const memberRes = await axios.get(`http://localhost:8081/api/registrations/member/${memberId}`);
      setMemberDetails(memberRes.data);

      // Fetch bills
      const billsRes = await axios.get(`http://localhost:8081/api/bills/member/${id}`);
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
        lateFee: 0,
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
        lateFee: 0,
      }));

      // Merge and sort by date
      let merged = [...bills, ...payments].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Apply late fees
      const today = new Date();
      const newTransactions = [...merged];

      bills.forEach((bill) => {
        const paymentsAfterBill = payments.filter(
          (pmt) => new Date(pmt.date) > new Date(bill.date)
        );
        let billBalance = bill.debit;
        paymentsAfterBill.forEach((pmt) => {
          billBalance -= pmt.credit;
        });
        const billDate = new Date(bill.date);
        const diffInDays = Math.floor((today - billDate) / (1000 * 60 * 60 * 24));
        if (diffInDays > 30 && billBalance > 0) {
          const lateFee = billBalance * 0.05;
          newTransactions.push({
            id: `latefee-${bill.id}`,
            date: today.toISOString().split("T")[0],
            description: "Late Payment",
            debit: lateFee,
            credit: 0,
            memberId: bill.memberId,
            meterReadingThisMonth: "-",
            meterReadingRemain: "-",
            monthUnit: "-",
            unit: "-",
            fixCharge: "-",
            lateFee: lateFee,
          });
        }
      });

      // Recalculate balance
      let balance = 0;
      const withBalance = newTransactions
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((item) => {
          balance += item.debit - item.credit;
          return { ...item, balance };
        });

      setTransactions(withBalance);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions or member details.");
      setTransactions([]);
      setMemberDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(memberId.trim());
  };

  const exportToExcel = () => {
    if (transactions.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `transactions_${memberId}.xlsx`);
  };

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
      "Late Fee",
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
        <button className="btn-back" onClick={() => navigate(-1)}>
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
        {!loading && memberDetails && (
         <div className="member-details-card">
           <h3>Member Details</h3>
           <div className="member-details-grid">
             <div className="member-field">
               <strong>Member ID:</strong> {memberDetails.memberId}
             </div>
             <div className="member-field">
               <strong>Name:</strong> {memberDetails.name}
             </div>
             <div className="member-field">
               <strong>Address:</strong> {memberDetails.address}
             </div>
             <div className="member-field">
               <strong>Phone Number:</strong> {memberDetails.phoneNumber}
             </div>
             <div className="member-field">
               <strong>Land No:</strong> {memberDetails.landNo}
             </div>
             <div className="member-field">
               <strong>Join Date:</strong> {memberDetails.joinDate}
             </div>
             <div className="member-field">
               <strong>End Date:</strong> {memberDetails.endDate || "-"}
             </div>
             <div className="member-field">
               <strong>National ID:</strong> {memberDetails.nationalId}
             </div>
             <div className="member-field">
               <strong>Status:</strong> {memberDetails.status}
             </div>
           </div>
         </div>

        )}

        {!loading && transactions.length === 0 && !error && <p>No transactions found.</p>}

        {transactions.length > 0 && (
          <>
            <div className="export-buttons" style={{ marginBottom: "10px" }}>
              <button onClick={exportToExcel}>Download Excel</button>
              <button onClick={exportToPDF}>Download PDF</button>
            </div>

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
                  <th>Late Fee</th>
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
                    <td>{t.lateFee ? t.lateFee.toFixed(2) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
