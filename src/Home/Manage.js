import React from "react";
import { FileText, DollarSign, Users, CreditCard, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import "./Admin.css";
import "./AppHome.css";

const Reports = () => {
  const navigate = useNavigate();

  const reportItems = [

    { name: "Billing Details", icon: <FileText size={24} />, path: "managebilling" },
    { name: "Members Maintenance Details ", icon: <FileText size={24} />, path: "maintenance" },
    { name: "Expenses Details", icon: <Shield size={24} />, path: "expenses" },
    { name: "Bill Payment Details", icon: <CreditCard size={24} />, path: "managepayment" },
    { name: "Members Maintenance Payment Details", icon: <CreditCard size={24} />, path: "maintenancepayment" },
    { name: "Member Details", icon: <Users size={24} />, path: "memberdetails" },
    { name: "Tariff Details", icon: <DollarSign size={24} />, path: "tariff" },
  ];

  return (
    <div>
      {/* Top bar with Back button */}
      <div className="form-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={4} /> Back
        </button>
      </div>

      <div className="dashboard-content">
        <h1 className="dashboard-title">Manage Details</h1>

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
