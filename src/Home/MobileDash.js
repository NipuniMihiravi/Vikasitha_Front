import React from "react";
import { UserPlus, CreditCard, FileText, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "./Admin.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Bill Generation", icon: <FileText size={24} />, path: "/main/bill" },
    { name: "Payment", icon: <CreditCard size={24} />, path: "/main/payment" },
    { name: "Maintenance", icon: <CreditCard size={24} />, path: "/main/maintenance" },
    { name: "User Profile", icon: <User size={24} />, path: "/main/access" },
    { name: "Registration", icon: <UserPlus size={24} />, path: "/main/registration" },
  ];

  const handleLogout = () => {
    sessionStorage.clear(); // clear session storage
    navigate("/"); // navigate to login page
  };

  return (
    <div className="dashboard-content">
      {/* Top Bar */}
      <div className="dashboard-top-bar">
        <h1 className="dashboard-title">විකසිත ප්‍රජා මූල සංවිධානය</h1>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={20} style={{ marginRight: "5px" }} />

        </button>
      </div>

      {/* Menu Cards */}
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
