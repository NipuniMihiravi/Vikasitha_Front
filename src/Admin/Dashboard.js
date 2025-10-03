import React from "react";
import { UserPlus, CreditCard, FileText, BarChart2, User, Home } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ import Link
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
    <div className="dashboard-layout">
      {/* Left Navbar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Vikasitha</h2>
        <ul className="sidebar-menu">
          <li>
            <Link to="/">
              <Home size={20} /> Home
            </Link>
          </li>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>
                {item.icon} {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Dashboard */}
      <div className="dashboard-container">
        <h1 className="dashboard-title">Vikasitha Dashboard</h1>

        <div className="menu-grid">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path}>
              <div className="menu-card blue-purple">
                {item.icon}
                <p className="menu-text">{item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





