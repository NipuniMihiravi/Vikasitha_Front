import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MemberLedger = () => {
  const navigate = useNavigate();

  const [memberId, setMemberId] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);

  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [maintenancePayments, setMaintenancePayments] = useState([]);
  const [ledger, setLedger] = useState([]);

  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");

  // Fetch member details
  const fetchMemberDetails = async () => {
    if (!memberId) return;
    try {
      const res = await axios.get(`https://vikasitha-back.onrender.com/api/registrations/member/${memberId}`);
      setMemberDetails(res.data || null);
      fetchTransactions();
    } catch (err) {
      console.error("Error fetching member:", err);
      setMemberDetails(null);
      setLedger([]);
    }
  };

  // Fetch transactions for member
  const fetchTransactions = async () => {
    try {
      const [bRes, pRes, mRes, mpRes] = await Promise.all([
        axios.get("https://vikasitha-back.onrender.com/api/bills"),
        axios.get("https://vikasitha-back.onrender.com/api/payments"),
        axios.get("https://vikasitha-back.onrender.com/api/maintenance"),
        axios.get("https://vikasitha-back.onrender.com/api/maintenance-payments"),
      ]);

      const billsMember = (bRes.data || []).filter(b => b.memberId === memberId);
      const paymentsMember = (pRes.data || []).filter(p => p.memberId === memberId);
      const maintenanceMember = (mRes.data || []).filter(m => m.memberId === memberId);
      const maintenancePaymentsMember = (mpRes.data || []).filter(mp => mp.memberId === memberId);

      // Combine into ledger
      const tempLedger = [];

      billsMember.forEach(b =>
        tempLedger.push({
          type: "Bill",
          date: b.meterReadingThisMonthDate,
          description: `Bill for ${b.memberId}`,
          debit: b.thisMonthTotal || 0,
          credit: 0,
        })
      );

      paymentsMember.forEach(p =>
        tempLedger.push({
          type: "Bill Payment",
          date: p.paymentDate,
          description: `Payment for ${p.memberId}`,
          debit: 0,
          credit: p.payment || 0,
        })
      );

      maintenanceMember.forEach(m =>
        tempLedger.push({
          type: "Maintenance",
          date: m.date,
          description: m.description,
          debit: m.cost || 0,
          credit: 0,
        })
      );

      maintenancePaymentsMember.forEach(mp =>
        tempLedger.push({
          type: "Maintenance Payment",
          date: mp.date,
          description: `Maintenance Payment ${mp.memberId}`,
          debit: 0,
          credit: mp.amount || 0,
        })
      );

      // Sort old date first
      tempLedger.sort((a, b) => new Date(a.date) - new Date(b.date));

      setLedger(tempLedger);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setLedger([]);
    }
  };

  // Filter ledger by date
  const getFilteredLedger = () => {
    return ledger.filter(row => {
      const d = new Date(row.date);
      if (filterYear && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth && d.getMonth() + 1 !== Number(filterMonth)) return false;
      if (filterQuarter) {
        const month = d.getMonth() + 1;
        const q = Math.ceil(month / 3);
        if (q !== Number(filterQuarter)) return false;
      }
      return true;
    });
  };

  let runningBalance = 0;

  return (
    <div>
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="billing-dashboard">
        <h2 className="form-title">Member Ledger</h2>

        {/* Member Search */}
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

        {/* Ledger Table */}
        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredLedger().map((row, i) => {
                runningBalance += row.credit - row.debit;
                return (
                  <tr key={i}>
                    <td>{row.date}</td>
                    <td>{row.type}</td>
                    <td>{row.description}</td>
                    <td>{row.debit}</td>
                    <td>{row.credit}</td>
                    <td>{runningBalance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberLedger;
