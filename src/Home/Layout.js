import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  UserPlus,
  CreditCard,
  FileText,
  BarChart2,
  User,
  Home,
  Menu,
  X
} from "lucide-react";
import "./Admin.css";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Registration", icon: <UserPlus size={20} />, path: "/registration" },
    { name: "Payment", icon: <CreditCard size={20} />, path: "/payment" },
    { name: "Bill", icon: <FileText size={20} />, path: "/bill" },
    { name: "Reports", icon: <BarChart2 size={20} />, path: "/reports" },
    { name: "User Profile", icon: <User size={20} />, path: "/profile" },
  ];

  return (
    <div className="dashboard-layout">
      {/* Toggle Button for Mobile */}
      <button
        className="toggle-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Vikasitha</h2>
        <ul className="sidebar-menu">
          <li onClick={() => setIsSidebarOpen(false)}>
            <Link to="/">
              <Home size={20} /> Home
            </Link>
          </li>

          {menuItems.map((item, index) => (
            <li key={index} onClick={() => setIsSidebarOpen(false)}>
              <Link to={item.path}>
                {item.icon} {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="dashboard-container" onClick={() => setIsSidebarOpen(false)}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
