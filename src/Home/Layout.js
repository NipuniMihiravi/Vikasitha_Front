import React from "react";
import { Outlet, Link } from "react-router-dom";
import { UserPlus, CreditCard, FileText, BarChart2, User, Home } from "lucide-react";
import "./Admin.css";

const Layout = () => {
  const menuItems = [
    { name: "Registration", icon: <UserPlus size={24} />, path: "/registration" },
    { name: "Payment", icon: <CreditCard size={24} />, path: "/payment" },
    { name: "Bill", icon: <FileText size={24} />, path: "/bill" },
    { name: "Reports", icon: <BarChart2 size={24} />, path: "/reports" },
    { name: "User Profile", icon: <User size={24} />, path: "/profile" },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar stays always */}
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

      {/* Dynamic Content */}
      <div className="dashboard-container">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
