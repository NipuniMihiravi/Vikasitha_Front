import React from "react";
import { FileText, DollarSign, Users, CreditCard, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Reports = () => {
  const navigate = useNavigate();

  const reportItems = [
    {
      name: "Tariff Report",
      icon: <DollarSign size={24} />,
       buttons: [
              { label: "Manage Details", path: "tariff" },

            ],
    },
    {
      name: "Bill Report",
      icon: <FileText size={24} />,
      // Custom paths for buttons
      buttons: [
        { label: "View Details", path: "billingdetails" },
        { label: "Manage Details", path: "managebilling" },
      ],
    },

      {
          name: "Bill Summery",
          icon: <Shield size={24} />,
         buttons: [
                 { label: "View Details", path: "access" },

               ],

        },

    {
      name: "Payment Report",
      icon: <CreditCard size={24} />,
      buttons: [
        { label: "View Details", path: "payment" },
        { label: "Manage Details", path: "managepayment " },
      ],
    },

      {
          name: "Member Details",
          icon: <Users size={24} />,
          buttons: [
            { label: "Manage Details", path: "memberdetails" },

          ],
        },

  ];

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Reports</h1>

      <div className="menu-grid">
        {reportItems.map((item, index) => (
          <div key={index} className="menu-card blue-purple">
            {item.icon}
            <p className="menu-text">{item.name}</p>

            {/* Check if buttons exist */}
            {item.buttons ? (
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
            ) : null /* No buttons for other cards */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
