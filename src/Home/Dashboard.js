import React from "react";
import { UserPlus, CreditCard, FileText, BarChart2, User } from "lucide-react";
import { Link } from "react-router-dom";
import "./Admin.css";

const Dashboard = () => {
  const menuItems = [


    { name: "Bill Generation", icon: <FileText size={24} />, path: "/main/bill" },
    { name: "Payment", icon: <CreditCard size={24} />, path: "/main/payment" },
    { name: "User Profile", icon: <User size={24} />, path: "/main/reports/access" },
    { name: "Reports", icon: <BarChart2 size={24} />, path: "/main/reports" },
     { name: "Registration", icon: <UserPlus size={24} />, path: "/main/registration" },

  ];

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Vikasitha Dashboard</h1>


      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="menu-link">
            <div className="menu-card">
              {item.icon}
              <p className="menu-text">{item.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
