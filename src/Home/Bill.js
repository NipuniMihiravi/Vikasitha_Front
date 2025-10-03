import React, { useState } from "react";
import axios from "axios";
import "./AppHome.css"; // create overlay styles
import { ArrowLeft } from "lucide-react"; // Modern back icon
import { useNavigate } from "react-router-dom"; // For navigation

const BillingForm = () => {
  const [memberId, setMemberId] = useState("");
  const navigate = useNavigate();
  const [memberDetails, setMemberDetails] = useState(null);
  const [lastBill, setLastBill] = useState(null);
  const [billHistory, setBillHistory] = useState([]);
  const [showSection, setShowSection] = useState("");
  const [newBill, setNewBill] = useState({
    meterReadingThisMonthDate: "",
    meterReadingThisMonth: 0,
    fixCharge: 0,
    fine: 0,
    paymentDate: "",
  });

  const [currentTariff, setCurrentTariff] = useState(null);
  const [calculated, setCalculated] = useState({
    meterReadingRemain: 0,
    unit: 0,
    thisMonthCharge: 0,
    thisMonthTotal: 0,
    toBePaidTotal: 0,
  });
  const [step, setStep] = useState(1);

  // 🔹 Function to calculate days
  function getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // 🔹 Function to calculate units
  function calculateUnits(newBill, lastBill) {
    if (!newBill.meterReadingThisMonth || !lastBill)
      return { unit: 0, remain: 0, prevRemain: 0 };

    const currentReading = Number(newBill.meterReadingThisMonth);
    const lastReading = Number(lastBill.meterReadingThisMonth);
    const prevRemain = Number(lastBill.meterReadingRemain || 0);

    const totalUnits = currentReading - lastReading + prevRemain;
    const lastDate = new Date(lastBill.meterReadingThisMonthDate);
    const currentDate = new Date(newBill.meterReadingThisMonthDate);
    const daysDiff = getDaysBetween(lastDate, currentDate);

    let unit = 0;
    let remain = 0;

    if (daysDiff === 30) {
      unit = totalUnits;
      remain = 0;
    } else if (daysDiff > 30) {
      const perDayUnits = totalUnits / daysDiff;
      unit = perDayUnits * 30;
      remain = totalUnits - unit;
    } else {
      unit = totalUnits;
      remain = 0;
    }

    return {
      unit: parseFloat(unit.toFixed(2)),
      remain: parseFloat(remain.toFixed(2)),
      prevRemain: parseFloat(prevRemain.toFixed(2)),
    };
  }

  // 🔹 Fetch Member Details
  const fetchMemberDetails = async () => {
    try {
      const regRes = await axios.get(
        `http://localhost:8081/api/registrations/member/${memberId}`
      );
      setMemberDetails(regRes.data);
    } catch (error) {
      console.error("Error fetching member:", error);
      alert("Member not found!");
      setMemberDetails(null);
      setLastBill(null);
      return;
    }

    try {
      const billRes = await axios.get(
        `http://localhost:8081/api/bills/member/${memberId}`
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
      console.warn("No bills found for this member.");
      setLastBill(null);
    }

    try {
      const tariffRes = await axios.get(
        `http://localhost:8081/api/tariff/current`
      );
      const fixCharge = tariffRes.data?.fixCharge ?? 0;
      setNewBill((prev) => ({ ...prev, fixCharge }));
    } catch {
      console.warn("No tariff data found, using default 0.");
      setNewBill((prev) => ({ ...prev, fixCharge: 0 }));
    }
  };

  // 🔹 Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBill({ ...newBill, [name]: value });
  };

  // 🔹 Calculate Bill
  const calculateBill = async () => {
    if (!lastBill) return;

    const prevRemain = Number(lastBill.meterReadingRemain || 0);
    const monthUnit =
      Number(newBill.meterReadingThisMonth) -
      Number(lastBill.meterReadingThisMonth);

    const totalUnits = monthUnit + prevRemain;
    let unitCharge = 0;

    const { data: tariffs } = await axios.get(
      "http://localhost:8081/api/tariff"
    );
    const sortedTariffs = tariffs.sort((a, b) => a.minUnit - b.minUnit);

    for (let slab of sortedTariffs) {
      if (totalUnits < slab.minUnit) continue;
      let unitsInSlab = Math.min(totalUnits, slab.maxUnit) - slab.minUnit + 1;
      if (unitsInSlab > 0) {
        unitCharge += unitsInSlab * slab.unitPrice;
      }
    }

    const fixCharge = Number(newBill.fixCharge) || 0;
    const thisMonthTotal = unitCharge + fixCharge;
    const toBePaidTotal = thisMonthTotal + (lastBill.lastMonthBalance || 0);

    setCalculated({
      monthUnit,
      unit: totalUnits,
      remain: calculateUnits(newBill, lastBill).remain,
      thisMonthCharge: unitCharge,
      thisMonthTotal,
      toBePaidTotal,
    });

    setNewBill((prev) => ({ ...prev, fixCharge }));
  };

  // 🔹 Save Bill
  const handleSaveBill = async (e) => {
    e.preventDefault();
    calculateBill();

    try {
      const payload = {
        memberId,
        name: memberDetails?.name,
        address: memberDetails?.address,
        phoneNumber: memberDetails?.phoneNumber,
        meterReadingThisMonthDate: newBill.meterReadingThisMonthDate,
        meterReadingThisMonth: newBill.meterReadingThisMonth,
        monthUnit: calculated.monthUnit,
        meterReadingRemain: calculated.remain,
        unit: calculated.unit,
        thisMonthCharge: calculated.thisMonthCharge,
        fixCharge: newBill.fixCharge,
        fine: newBill.fine,
        thisMonthTotal: calculated.thisMonthTotal,
        toBePaidTotal: calculated.toBePaidTotal,
        paymentDate: newBill.paymentDate,
      };

      await axios.post("http://localhost:8081/api/bills", payload);
      alert("Bill saved successfully!");
      setLastBill(payload);
      setShowSection("");
      setNewBill({
        meterReadingThisMonthDate: "",
        meterReadingThisMonth: 0,
        fixCharge: 0,
        fine: 0,
        paymentDate: "",
      });
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to save bill.");
    }
  };

  // 🔹 Fetch Bill History
  const fetchBillHistory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/api/bills/member/${memberId}`
      );
      setBillHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      setBillHistory([]);
    }
  };

  const [latestPayment, setLatestPayment] = useState(null);

  const fetchLatestPayment = async (memberId) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/payments/member/${memberId}`);
      setLatestPayment(response.data);
    } catch (error) {
      console.error("Error fetching latest payment:", error);
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
              fetchLatestPayment(memberId);   // ✅ fetch latest payment
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
                    onClick={() => setStep(2)}
                    className="btn-primary"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSection("")} // closes the modal
                    className="btn-secondary"

                  >
                    Close
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
                    <label>Current Month Units:</label>
                    <input
                      type="number"
                      value={
                        lastBill
                          ? Number(newBill.meterReadingThisMonth || 0) -
                            Number(lastBill.meterReadingThisMonth || 0)
                          : 0
                      }
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
                    <label>
                      Units (This Month + Last Month Remaining):
                    </label>
                    <input
                      type="number"
                      value={
                        lastBill
                          ? Number(newBill.meterReadingThisMonth || 0) -
                            Number(lastBill.meterReadingThisMonth || 0) +
                            Number(lastBill.meterReadingRemain || 0)
                          : 0
                      }
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
                      Last Month Remaining Units (වැඩිම) :
                    </td>
                    <td className="english-value">{lastBill?.remain}</td>
                  </tr>
                  <tr>
                    <td className="sinhala-label">වැඩිම :</td>
                    <td className="english-value">Remaining Units: {calculated.remain}</td>
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
                <th>Paid Date</th>
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
  {showSection === "payments" && latestPayment && (
    <div className="payment-details">
      <h3 className="payment-title">Payment Details</h3>

      <table className="payment-table">
        <thead>
          <tr>
            <th>Last Payment</th>
            <th>Payment Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rs. {latestPayment.payment || "-"}</td>
            <td>{latestPayment.paymentDate || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )}


 </div>
    </div>
  );
};

export default BillingForm;
