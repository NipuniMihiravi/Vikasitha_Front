import React from "react";
import { FileText, DollarSign, Users, CreditCard, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Modern back icon
import "./Admin.css";
import "./AppHome.css";

const Reports = () => {
  const navigate = useNavigate();

  const reportItems = [
    {
      name: "Tariff Report",
      icon: <DollarSign size={24} />,
      buttons: [{ label: "Manage Details", path: "tariff" }],
    },
    {
      name: "Bill Report",
      icon: <FileText size={24} />,
      buttons: [
        { label: "View Details", path: "billingdetails" },
        { label: "Manage Details", path: "managebilling" },
      ],
    },
    {
      name: "Bill Summary",
      icon: <Shield size={24} />,
      buttons: [{ label: "View Details", path: "access" }],
    },
    {
      name: "Payment Report",
      icon: <CreditCard size={24} />,
      buttons: [
        { label: "View Details", path: "payment" },
        { label: "Manage Details", path: "managepayment" },
      ],
    },
    {
      name: "Member Details",
      icon: <Users size={24} />,
      buttons: [{ label: "Manage Details", path: "memberdetails" }],
    },
  ];

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
    <div className="dashboard-content">
      <h1 className="dashboard-title">Reports</h1>

      <div className="menu-grid">
        {reportItems.map((item, index) => (
          <div key={index} className="menu-card">
            {item.icon}
            <p className="menu-text">{item.name}</p>

            <div className="card-buttons">
              {item.buttons.map((btn, idx) => (
                <button
                  key={idx}
                  className="btn-report"
                  onClick={() => navigate(btn.path)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Reports;
