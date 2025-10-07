import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AppHome.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BillingForm = () => {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);
  const [lastBill, setLastBill] = useState(null);
  const [billHistory, setBillHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showSection, setShowSection] = useState("");
  const [step, setStep] = useState(1);

  const [newBill, setNewBill] = useState({
    meterReadingThisMonthDate: "",
    meterReadingThisMonth: 0,
    fixCharge: 0,
    fine: 0,
    paymentDate: "",
  });

  const [calculated, setCalculated] = useState({
    meterReadingRemain: 0,
    unit: 0,
    thisMonthCharge: 0,
    thisMonthTotal: 0,
    toBePaidTotal: 0,
  });

  // ✅ Auto-fill current date when component loads
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setNewBill((prev) => ({ ...prev, meterReadingThisMonthDate: formatted }));
  }, []);

  // 🔹 Helper: calculate days between two dates
  const getDaysBetween = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  // 🔹 Improved unit calculation based on days and remaining units
  const calculateUnits = (newBill, lastBill) => {
    if (!lastBill || !newBill.meterReadingThisMonth) {
      return { unit: 0, remain: 0 };
    }

    const prevReading = Number(lastBill.meterReadingThisMonth || 0);
    const currReading = Number(newBill.meterReadingThisMonth || 0);
    const prevRemain = Number(lastBill.meterReadingRemain || 0);

    const totalUnits = currReading - prevReading + prevRemain;
    const daysDiff = getDaysBetween(
      lastBill.meterReadingThisMonthDate,
      newBill.meterReadingThisMonthDate
    );

    let unit = 0;
    let remain = 0;

    if (daysDiff < 30) {
      unit = Math.round((totalUnits / 30) * daysDiff);
      remain = totalUnits - unit;
    } else if (daysDiff === 30) {
      unit = totalUnits;
      remain = 0;
    } else {
      const perDayUsage = totalUnits / daysDiff;
      unit = Math.round(perDayUsage * 30);
      remain = Math.round(totalUnits - unit);
    }

    return { unit, remain };
  };

  // 🔹 Fetch Member Details
  const fetchMemberDetails = async () => {
    try {
      const regRes = await axios.get(
        `https://vikasitha-back.onrender.com/api/registrations/member/${memberId}`
      );
      setMemberDetails(regRes.data);
    } catch (err) {
      alert("Member not found!");
      setMemberDetails(null);
      setLastBill(null);
      return;
    }

    try {
      const billRes = await axios.get(
        `https://vikasitha-back.onrender.com/api/bills/member/${memberId}`
      );
      if (billRes.data?.length > 0) {
        const latest = billRes.data[billRes.data.length - 1];
        setLastBill(latest);
        setNewBill((prev) => ({
          ...prev,
          meterReadingLastMonth: latest.meterReadingThisMonth,
          meterReadingLastMonthDate: latest.meterReadingThisMonthDate,
        }));
      } else {
        setLastBill(null);
      }
    } catch {
      setLastBill(null);
    }

    try {
      const tariffRes = await axios.get(`https://vikasitha-back.onrender.com/api/tariff/current`);
      const fixCharge = tariffRes.data?.fixCharge ?? 0;
      setNewBill((prev) => ({ ...prev, fixCharge }));
    } catch {
      setNewBill((prev) => ({ ...prev, fixCharge: 0 }));
    }
  };

  // 🔹 Handle input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBill((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Calculate Bill
  const calculateBill = async () => {
    if (!lastBill) return;

    const { unit, remain } = calculateUnits(newBill, lastBill);
    let unitCharge = 0;

    const { data: tariffs } = await axios.get(`https://vikasitha-back.onrender.com/api/tariff`);
    const sortedTariffs = tariffs.sort((a, b) => a.minUnit - b.minUnit);

    for (let slab of sortedTariffs) {
      if (unit < slab.minUnit) continue;
      let unitsInSlab = Math.min(unit, slab.maxUnit) - slab.minUnit + 1;
      if (unitsInSlab > 0) {
        unitCharge += unitsInSlab * slab.unitPrice;
      }
    }

    const fixCharge = Number(newBill.fixCharge) || 0;
    const thisMonthTotal = unitCharge + fixCharge;
    const toBePaidTotal = thisMonthTotal + (lastBill.lastMonthBalance || 0);

    setCalculated({
      unit,
      remain,
      thisMonthCharge: unitCharge,
      thisMonthTotal,
      toBePaidTotal,
    });
  };

  // 🔹 Save Bill
  const handleSaveBill = async (e) => {
    e.preventDefault();
    await calculateBill();

    try {
      const payload = {
        memberId,
        name: memberDetails?.name,
        address: memberDetails?.address,
        phoneNumber: memberDetails?.phoneNumber,
        meterReadingThisMonthDate: newBill.meterReadingThisMonthDate,
        meterReadingThisMonth: newBill.meterReadingThisMonth,
        monthUnit: calculated.unit,
        meterReadingRemain: calculated.remain,
        unit: calculated.unit,
        thisMonthCharge: calculated.thisMonthCharge,
        fixCharge: newBill.fixCharge,
        fine: newBill.fine,
        thisMonthTotal: calculated.thisMonthTotal,
        toBePaidTotal: calculated.toBePaidTotal,
        paymentDate: newBill.paymentDate,
      };

      await axios.post("https://vikasitha-back.onrender.com/api/bills", payload);
      alert("Bill saved successfully!");
      setLastBill(payload);
      setShowSection("");
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to save bill.");
    }
  };

  // 🔹 Fetch Payment
const fetchPayments = async (memberId) => {
  try {
    const res = await axios.get(`http://localhost:8081/api/payments/member/${memberId}`);
    // assuming API returns an array of payment objects
    setPayments(Array.isArray(res.data) ? res.data : [res.data]);
  } catch (err) {
    console.error("Error fetching payments:", err);
    setPayments([]);
  }
};

  // 🔹 Fetch Bill History
  const fetchBillHistory = async () => {
    try {
      const res = await axios.get(`https://vikasitha-back.onrender.com/api/bills/member/${memberId}`);
      setBillHistory(res.data);
    } catch {
      setBillHistory([]);
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
      <h2 className="form-title">Billing Form</h2>

      {/* Search Section */}
      <div className="member-form">
        <div className="form-group">
          <label>Member ID:</label>
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
          <div className="form-actions">
            <button onClick={fetchMemberDetails} className="btn-primary">
              Fetch Member
            </button>
          </div>
        </div>
      </div>

      {/* Member Details */}
      {memberDetails && (
        <div className="member-details">
          <h3 className="member-title">Member Details</h3>
          <div className="member-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{memberDetails.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span className="info-value">{memberDetails.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{memberDetails.phoneNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {memberDetails && (
        <div className="form-actions">
          <button
            onClick={() => {
              setShowSection("generate");
              setStep(1);
            }}
            className="btn-primary"
          >
            Generate Bill
          </button>
          <button
            onClick={() => {
              fetchBillHistory();
              setShowSection("history");
            }}
            className="btn-primary"
          >
            Bill History
          </button>

         <button
           onClick={() => {
             fetchPayments(memberId);
             setShowSection("payments");
           }}
           className="btn-primary"
         >
           Payment Details
         </button>

        </div>
      )}

      {/* Generate Bill Modal */}
      {showSection === "generate" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Enter New Bill</h3>
            <form onSubmit={handleSaveBill} className="member-form">
              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="form-group">
                    <label>Meter Reading This Month:</label>
                    <input
                      type="number"
                      name="meterReadingThisMonth"
                      value={newBill.meterReadingThisMonth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                 <div className="form-group">
                       <label>Date of Meter Reading:</label>
                       <input
                         type="date"
                         name="meterReadingThisMonthDate"
                         value={newBill.meterReadingThisMonthDate}
                         onChange={handleInputChange}
                         required
                       />
                     </div>
                <div className="form-actions">

                 <button
                  type="button"
                  onClick={() => setShowSection("")} // closes the modal
                  className="btn-secondary"

                   >
                   Close
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary"
                  >
                    Next
                  </button>

                </div>

                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <div className="form-group">
                    <label>Fix Charge:</label>
                    <input
                      type="number"
                      name="fixCharge"
                      value={newBill.fixCharge}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Month Reading:</label>
                    <input
                      type="number"
                      value={lastBill ? lastBill.meterReadingThisMonth : 0}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Month Reading Date:</label>
                    <input
                      type="date"
                      value={lastBill ? lastBill.meterReadingThisMonthDate : ""}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Previous Remaining Units:</label>
                    <input
                      type="number"
                      value={lastBill?.meterReadingRemain || 0}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Month Units (Calculated):</label>
                    <input
                      type="number"
                      value={calculateUnits(newBill, lastBill).unit}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Carry Forward to Next Month:</label>
                    <input
                      type="number"
                      value={calculateUnits(newBill, lastBill).remain}
                      readOnly
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await calculateBill();
                        setStep(3);
                      }}
                      className="btn-primary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <h4>Calculated Values:</h4>
                   <div className="form-group">
                      <label>Units (This Month + Last Month Remaining):</label>
                      <input
                        type="number"
                        value={calculateUnits(newBill, lastBill).unit}
                        readOnly
                      />
                    </div>
                  <div className="form-group">
                    <label>This Month Charge:</label>
                    <input
                      type="number"
                      value={calculated.thisMonthCharge.toFixed(2)}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>This Month Total:</label>
                    <input
                      type="number"
                      value={calculated.thisMonthTotal.toFixed(2)}
                      readOnly
                    />
                  </div>
                 <div className="form-actions">
                       <button
                         type="button"
                         onClick={() => setStep(2)}
                         className="btn-secondary"
                       >
                         Back
                       </button>
                       <button
                         type="button"
                         onClick={() => setStep(4)}   // ✅ Move to Step 4
                         className="btn-primary"
                       >
                         Generate Bill
                       </button>
                     </div>
                </div>
              )}



       {step === 4 && (
         <div id="bill-print" className="bill-preview">
           <h3 className="bill-title">විකසිත ප්‍රජා මූල සංවිධානය / <span className="english">Vikasitha Praja Muula Sanvidanaya</span></h3>

           <table className="bill-table">
          <tbody>
                  {/* Member Info */}
                  <tr>
                    <td className="sinhala-label">Member ID (සාමාජික අංකය) :</td>
                    <td className="english-value">{memberId}</td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">Name (නම) :</td>
                    <td className="english-value">{memberDetails?.name}</td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">Address (ලිපිනය) :</td>
                    <td className="english-value">{memberDetails?.address}</td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">Date (දිනය) :</td>
                    <td className="english-value">{newBill.meterReadingThisMonthDate}</td>
                  </tr>

                  {/* Meter Details */}
                  <tr className="section-header">
                    <td colSpan="2">
                      මාපක විස්තර / <span className="english">Meter Details</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">
                      Last Reading (අවසන් මස මාපක කියවීම) :
                    </td>
                    <td className="english-value">{lastBill?.meterReadingThisMonth}</td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">
                      Current Reading (වත්මන් මාසයේ කියවීම) :
                    </td>
                    <td className="english-value">{newBill.meterReadingThisMonth}</td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">Units Used (භාවිතා කළ ඒකක) :</td>
                    <td className="english-value">{calculated.unit}</td>
                  </tr>
                 <tr>
                   <td className="sinhala-label">
                     Last Month Remaining Units (පසුගිය මාසයේ වැඩිම) :
                   </td>
                   <td className="english-value">
                     {lastBill?.remain !== undefined && lastBill?.remain !== null
                       ? lastBill.remain
                       : "0"}
                   </td>
                 </tr>
                 <tr>
                   <td className="sinhala-label">
                     This Month Remaining Units (මෙම මාසයේ වැඩිම) :
                   </td>
                   <td className="english-value">
                     {calculated.remain !== undefined && calculated.remain !== null
                       ? calculated.remain
                       : "0"}
                   </td>
                 </tr>


                  {/* Charges */}
                  <tr className="section-header">
                    <td colSpan="2">
                      ගාස්තු / <span className="english">Charges</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">Fix Charge (ස්ථාවර ගාස්තු) :</td>
                    <td className="english-value">Rs. {newBill.fixCharge}</td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">
                      This Month Charge (මෙම මාස ගාස්තුව) :
                    </td>
                    <td className="english-value">
                      Rs. {calculated.thisMonthCharge.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">
                      This Month Total (මෙම මාස එකතුව) :
                    </td>
                    <td className="english-value">
                      Rs. {calculated.thisMonthTotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">Balance (ඉතිරි ශේෂය) :</td>
                    <td className="english-value">
                      Rs. {lastBill?.lastMonthBalance || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">Grand Total (මුළු එකතුව) :</td>
                    <td className="english-value">
                      Rs. {calculated.toBePaidTotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
           </table>






          <div className="form-actions">
            <button
              onClick={() => {
                const printContent = document.getElementById("bill-print").innerHTML;
                const newWindow = window.open("", "_blank");
                newWindow.document.write(`
                  <html>
                    <head>
                      <title>Electricity Bill</title>
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          padding: 20px;
                        }
                        .bill-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-top: 10px;
                          font-size: 14px;
                        }
                        .bill-table td {
                          padding: 6px 10px;
                          vertical-align: top;
                          border-bottom: 1px solid #ddd;
                        }
                        .sinhala-label {
                          font-weight: bold;
                          width: 40%;
                          text-align: left;
                          white-space: nowrap;
                        }
                        .english-value {
                          width: 60%;
                          text-align: left;
                        }
                        .section-header td {
                          font-weight: bold;
                          background: #f0f0f0;
                          padding: 8px;
                          text-align: center;
                          border-bottom: 2px solid #aaa;
                          border-top: 2px solid #aaa;
                        }
                        .bill-title {
                          text-align: center;
                          margin-bottom: 10px;
                        }
                      </style>
                    </head>
                    <body>
                      ${printContent}
                    </body>
                  </html>
                `);
                newWindow.document.close();
                newWindow.focus();
                newWindow.print();
                newWindow.close();
              }}
              className="btn-primary"
            >
              Print Bill
            </button>

            <button
              onClick={() => setShowSection("")}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
            </form>

                </div>
              </div>
            )}

      {/* Bill History */}
      {showSection === "history" && (
        <div className="bill-history">
          <h3 className="bill-history-title">Bill History</h3>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Meter Reading</th>
                <th>Total</th>

              </tr>
            </thead>
            <tbody>
              {[...billHistory]
                .sort((a, b) => new Date(b.meterReadingThisMonthDate) - new Date(a.meterReadingThisMonthDate)) // ✅ latest first
                .map((bill, index) => (
                  <tr key={index}>
                    <td>{bill.meterReadingThisMonthDate || "-"}</td>
                    <td>{bill.meterReadingThisMonth}</td>
                    <td>Rs. {bill.thisMonthTotal}</td>

                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Payment Details */}
  {/* Payment Details */}
  {showSection === "payments" && (
    <div className="payment-details">
      <h3 className="payment-title">All Payments</h3>

      <table className="payment-table">
        <thead>
          <tr>
            <th>Payment Amount (Rs.)</th>
            <th>Payment Date</th>

          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            [...payments]
              .sort(
                (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
              )
              .map((p, index) => (
                <tr key={index}>
                  <td>{p.payment || "-"}</td>
                  <td>{p.paymentDate || "-"}</td>

                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No payments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="form-actions">
        <button
          onClick={() => setShowSection("")}
          className="btn-secondary"
        >
          Close
        </button>
      </div>
    </div>
  )}



 </div>
    </div>
  );
};

export default BillingForm;
