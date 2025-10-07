import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  CreditCard,
  FileText,
  BarChart2,
  User,
  Home,
  Menu,
  X,
  LogOut
} from "lucide-react";
import "./Admin.css";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear(); // ✅ Clear session
    navigate("/"); // ✅ Redirect to login
  };

  // ✅ Menu items list (Logout is last)
  const menuItems = [
    { name: "Registration", icon: <UserPlus size={20} />, path: "/main/registration" },
    { name: "Payment", icon: <CreditCard size={20} />, path: "/main/payment" },
    { name: "Bill", icon: <FileText size={20} />, path: "/main/bill" },
    { name: "Reports", icon: <BarChart2 size={20} />, path: "/main/reports" },
    { name: "User Profile", icon: <User size={20} />, path: "/main/reports/access" },
    { name: "Logout", icon: <LogOut size={20} />, action: handleLogout }, // ✅ Added logout here
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
            <Link to="/main">
              <Home size={20} /> Home
            </Link>
          </li>

          {menuItems.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                setIsSidebarOpen(false);
                if (item.action) {
                  // ✅ handleLogout
                  item.action();
                }
              }}
            >
              {item.path ? (
                <Link to={item.path}>
                  {item.icon} {item.name}
                </Link>
              ) : (
                <span className={item.name === "Logout" ? "logout-btn" : ""}>
                  {item.icon} {item.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div
        className="dashboard-container"
        onClick={() => setIsSidebarOpen(false)}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
