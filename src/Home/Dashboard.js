import React from "react";
import { UserPlus, CreditCard, FileText, BarChart2, User } from "lucide-react";
import { Link } from "react-router-dom";
import "./Admin.css";

const Dashboard = () => {
  const menuItems = [
    { name: "Registration", icon: <UserPlus size={24} />, path: "/registration" },
    { name: "Payment", icon: <CreditCard size={24} />, path: "/payment" },
    { name: "Bill", icon: <FileText size={24} />, path: "/bill" },
    { name: "Reports", icon: <BarChart2 size={24} />, path: "/reports" },
    { name: "User Profile", icon: <User size={24} />, path: "/profile" },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Vikasitha Dashboard</h1>
      <p>Welcome to your dashboard! Choose a section below.</p>

      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="menu-link">
            <div className="menu-card blue-purple">
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
