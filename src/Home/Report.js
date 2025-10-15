import React from "react";
import { FileText, CreditCard, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./Admin.css";
import "./AppHome.css";

const Reports = () => {
  const navigate = useNavigate();

  const reportItems = [
    {
      name: "Bill Report",
      icon: <FileText size={24} />,
      path: "billingdetails",
    },
    {
      name: "Payment Report",
      icon: <CreditCard size={24} />,
      path: "payment",
    },
    {
      name: "Financial Summary",
      icon: <BarChart2 size={24} />,
      path: "summery",
    },
    {
      name: "Member Ledger",
      icon: <BarChart2 size={24} />,
      path: "memberledger",
    },
  ];

  return (
    <div>
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="dashboard-content">
        <h1 className="dashboard-title">Reports</h1>

        <div className="menu-grid">
          {reportItems.map((item, index) => (
            <div
              key={index}
              className="menu-card"
              onClick={() => navigate(item.path)}
              style={{ cursor: "pointer" }}
            >
              {item.icon}
              <p className="menu-text">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
