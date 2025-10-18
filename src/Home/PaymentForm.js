import React, { useState } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "./ConfirmDialog"; // reuse from BillingForm

const PaymentForm = () => {
  const navigate = useNavigate();

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [payment, setPayment] = useState({
    memberId: "",
    name: "",
    address: "",
    paymentDate: getTodayDate(),
    payment: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showPrintSection, setShowPrintSection] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch member details including address
  const handleMemberIdBlur = async () => {
    if (!payment.memberId) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `https://vikasitha-back.onrender.com/api/registrations/member/${payment.memberId}`
      );

      if (res.data) {
        setPayment((prev) => ({
          ...prev,
          name: res.data.name || "",
          address: res.data.address || "", // fetch address
        }));
      } else {
        setPayment((prev) => ({ ...prev, name: "", address: "" }));
        setShowErrorDialog(true);
      }
    } catch (err) {
      console.error(err);
      setPayment((prev) => ({ ...prev, name: "", address: "" }));
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("https://vikasitha-back.onrender.com/api/payments", payment);
      setShowSuccessDialog(true);
      setShowPrintSection(true); // show printable section
    } catch (err) {
      console.error(err);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("payment-print").innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head>
        <style>
                                   @media print {
                                     body {
                                       margin: 0;
                                       font-size: 11px;
                                       font-family: Arial, sans-serif;
                                     }
                                     table {
                                       border-collapse: collapse;
                                       width: 100%;
                                     }
                                     td, th {
                                       border: 1px solid #000;
                                       padding: 2px 4px;
                                     }
                                     .no-print {
                                       display: none;
                                     }
                                   }
                                 </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
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
        <h2 className="form-title">Enter Payment</h2>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>Member ID:</label>
            <input
              type="text"
              name="memberId"
              value={payment.memberId}
              onChange={handleChange}
              onBlur={handleMemberIdBlur}
              required
            />
          </div>

          <div className="form-group">
            <label>Name:</label>
            <input type="text" name="name" value={payment.name} readOnly />
          </div>

          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={payment.address}
              onChange={handleChange}
              readOnly // optional: make read-only if you don't want edits
            />
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>

        {/* Print Section */}
     {/* Print Section */}
     {showPrintSection && (
       <div id="payment-print" className="bill-container">
         {/* --- Printable content --- */}
         <div className="printable-content">
           <h3 className="bill-title">
             ජල බිල්පත් ගෙවීම්<br />
             <span className="english">විකසිත ප්‍රජා මූල සංවිධානය</span>
           </h3>

           <table className="bill-table">
             <tbody>
               <tr><th colSpan="4">Payment Receipt / ගෙවීම් ලැබීම</th></tr>
               <tr>
                 <td className="label">Member ID</td>
                 <td>{payment.memberId}</td>
                 <td className="label">Date</td>
                 <td>{payment.paymentDate}</td>
               </tr>
               <tr>
                 <td className="label">Name</td>
                 <td colSpan="3">{payment.name}</td>
               </tr>
               <tr>
                 <td className="label">Address</td>
                 <td colSpan="3">{payment.address}</td>
               </tr>

               <tr>
                 <td className="label">Payment Amount</td>
                 <td colSpan="3">Rs. {Number(payment.payment).toFixed(2)}</td>
               </tr>
             </tbody>
           </table>

           <p className="footer">Thank you! / ස්තුතියි!</p>
         </div>

         {/* --- Buttons --- */}
         <div className="form-actions no-print">
           <button onClick={handlePrint} className="btn-primary">Print Receipt</button>
           <button
             onClick={() => {
               setShowPrintSection(false);
               setPayment({
                 memberId: "",
                 name: "",
                 paymentDate: getTodayDate(),
                 payment: "",
               });
             }}
             className="btn-secondary"
           >
             Close
           </button>
         </div>
       </div>
     )}

      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <ConfirmDialog
          title="✅ Success"
          message="Payment saved successfully!"
          singleButton
          onConfirm={() => setShowSuccessDialog(false)}
        />
      )}

      {/* Error Dialog */}
      {showErrorDialog && (
        <ConfirmDialog
          title="❌ Error"
          message="Failed to fetch/save payment. Please try again."
          singleButton
          onConfirm={() => setShowErrorDialog(false)}
        />
      )}
    </div>
  );
};

export default PaymentForm;
