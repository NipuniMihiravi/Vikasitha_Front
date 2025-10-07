import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import { useNavigate } from "react-router-dom"; // For navigation

const GenerateBill = () => {
  const [memberId, setMemberId] = useState("");
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [memberInfo, setMemberInfo] = useState(null);

  const fetchMonthlySummary = async (e) => {
    e.preventDefault();
    if (!memberId) return;

    try {
      setLoading(true);
      setError("");
      setSummary(null);
      setMemberInfo(null);

      const res = await axios.get(
        `https://vikasitha-back.onrender.com/api/transactions/member/${memberId}`
      );

      const transactions = res.data;
      if (!transactions.length) {
        setError("No transactions found for this member.");
        return;
      }

      // Sort descending by date
      const sorted = transactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

       // Fetch member info from registration table
          const memberRes = await axios.get(`https://vikasitha-back.onrender.com/api/registrations/member/${memberId}`);
          setMemberInfo(memberRes.data);

 // Latest transaction with description "Monthly Bill"
 const latestBill = sorted
   .filter((t) => t.description === "Monthly Bill")
   .sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // get most recent

 // Current bill amount from this latest "Monthly Bill"
 const currentBillAmount = latestBill?.debit ?? 0;

 // Previous transaction with description "Monthly Bill" before this latest one
 const previousTxn = sorted
   .filter(
     (t) =>
       t.description === "Monthly Bill" &&
       new Date(t.date) < new Date(latestBill.date)
   )
   .sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // get previous one

   // Latest transaction regardless of description
   const latestTxn = sorted[0]; // sorted descending by date already

   // Current balance from latest transaction
   const currentBalance = latestTxn?.balance ?? 0;


 // Previous balance and meter reading
 const previousBalance = previousTxn?.balance ?? 0;
 const lastMeterReading = previousTxn?.meterReadingThisMonth ?? 0;

 // Payments after latest bill within 31 days
 const billDate = new Date(latestBill.date);
 const thirtyOneDaysAgo = new Date(billDate);
 thirtyOneDaysAgo.setDate(billDate.getDate() - 31);

 const payments = sorted.filter(
   (t) =>
     t.credit > 0 &&
     new Date(t.date) >= thirtyOneDaysAgo &&
     new Date(t.date) <= billDate
 );



 // Latest "Late Payment" transaction within last 31 days
 const latePaymentTxn = sorted
   .filter(
     (t) =>
       t.description === "Late Payment" &&
       new Date(t.date) >= thirtyOneDaysAgo
   )
   .sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // get the latest

 const lateFee = latePaymentTxn?.debit ?? 0; // assume debit is the fee amount


 const totalPayments = payments.reduce((sum, p) => sum + (p.credit || 0), 0);

 // Total units used
 const totalUnits = (latestBill?.meterReadingThisMonth ?? 0) - lastMeterReading;



 setSummary({
   latestBill,
   previousTxn,
   payments,
   previousBalance,
   lastMeterReading,
   totalUnits,
   totalPayments,
   currentBillAmount,
   currentBalance,
   lateFee,
 });


    } catch (err) {
      console.error(err);
      setError("Failed to fetch summary.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!summary) return;
    const printContent = document.getElementById("bill-print").innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head><title>Monthly Summary</title></head>
        <body>${printContent}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
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
    <div className="bill-container">
      <h3>Generate Latest Bill Summary (Last 31 Days)</h3>

      <form onSubmit={fetchMonthlySummary} style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Enter Member ID"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        />
        <button type="submit">Fetch Summary</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {summary && (
        <div
          id="bill-print"
          style={{
            border: "1px solid #000",
            padding: "20px",
            width: "500px",
            background: "#f9f9f9",
          }}
        >
          <h2>Monthly Bill Summary</h2>
          <p><strong>Member ID:</strong> {summary.latestBill?.memberId ?? summary.previousTxn?.memberId ?? "N/A"}</p>
         <p><strong>Name:</strong> {memberInfo?.name ?? "N/A"}</p>
            <p><strong>Address:</strong> {memberInfo?.address ?? "N/A"}</p>
          <p><strong>Bill Date:</strong> {summary.latestBill ? new Date(summary.latestBill.date).toLocaleDateString() : "N/A"}</p>
          <hr />

          <h4>Meter Reading Details:</h4>
          <p><strong>Previous Meter Reading:</strong> {summary.previousTxn?.meterReadingThisMonth ?? 0}</p>
          <p><strong>Latest Meter Reading:</strong> {summary.latestBill?.meterReadingThisMonth ?? summary.previousTxn?.meterReadingThisMonth ?? 0}</p>
          <p>
            <strong>Total Units Used:</strong>{" "}
            {summary.latestBill
              ? (summary.latestBill.meterReadingThisMonth ?? 0) - (summary.previousTxn?.meterReadingThisMonth ?? 0)
              : 0}
          </p>
          <p><strong>Remaining Units:</strong> {summary.latestBill?.meterReadingRemain ?? 0}</p>
          <hr />

          <h4>Bill Calculation:</h4>
          <p><strong>Previous Balance:</strong> {summary.previousBalance.toFixed(2)}</p>
          <p><strong>Payments Made:</strong> {summary.totalPayments.toFixed(2)}</p>
          <p><strong>Current Bill Amount:</strong> {(summary.currentBillAmount ?? 0).toFixed(2)}</p>
          <p><strong>Late Payment Fee:</strong> {(summary.lateFee ?? 0).toFixed(2)}</p>
          <p><strong>Current Balance:</strong> {(summary.currentBalance ?? 0).toFixed(2)}</p>

          <hr />
          <h4>Payments Details:</h4>
          {summary.payments.length ? (
            summary.payments.map((p) => (
              <p key={p.id}>
                {new Date(p.date).toLocaleDateString()} - {p.credit.toFixed(2)}
              </p>
            ))
          ) : (
            <p>No payments made in this period.</p>
          )}
        </div>
      )}

      {summary && (
        <button onClick={handlePrint} style={{ marginTop: "15px" }}>
          Print Summary
        </button>
      )}
    </div>
     </div>
  );
};

export default GenerateBill;
