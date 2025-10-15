import React, { useEffect, useState } from "react";
import { UserPlus, CreditCard, FileText, BarChart2, User,Settings, DollarSign  } from "lucide-react";
import { Link } from "react-router-dom";
import "./Admin.css";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Dashboard = () => {
  const menuItems = [
    { name: "Bill Generation", icon: <FileText size={24} />, path: "/main/bill" },
    { name: "Payment", icon: <CreditCard size={24} />, path: "/main/payment" },
    { name: "Maintenance", icon: <CreditCard size={24} />, path: "/main/maintenance" },
    { name: "Expenses", icon: <DollarSign size={24} />, path: "/main/expences-entering" },
    { name: "User Profile", icon: <User size={24} />, path: "/main/access" },
    { name: "Manage", icon: <Settings size={24} />, path: "/main/manage" },
    { name: "Report", icon: <BarChart2 size={24} />, path: "/main/report" },
    { name: "Registration", icon: <UserPlus size={24} />, path: "/main/registration" },
  ];

  const [totals, setTotals] = useState({
    bills: 0,
    billPayments: 0,
    maintenance: 0,
    maintenancePayments: 0,
    expenses: 0,
  });

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [bRes, pRes, mRes, mpRes, eRes] = await Promise.all([
          axios.get("https://vikasitha-back.onrender.com/api/bills"),
          axios.get("https://vikasitha-back.onrender.com/api/payments"),
          axios.get("https://vikasitha-back.onrender.com/api/maintenance"),
          axios.get("https://vikasitha-back.onrender.com/api/maintenance-payments"),
          axios.get("https://vikasitha-back.onrender.com/api/expenses"),
        ]);

        const totalBills = (bRes.data || []).reduce((sum, b) => sum + (b.thisMonthTotal || 0), 0);
        const totalBillPayments = (pRes.data || []).reduce((sum, p) => sum + (p.payment || 0), 0);
        const totalMaintenance = (mRes.data || []).reduce((sum, m) => sum + (m.cost || 0), 0);
        const totalMaintenancePayments = (mpRes.data || []).reduce((sum, mp) => sum + (mp.amount || 0), 0);
        const totalExpenses = (eRes.data || []).reduce((sum, ex) => sum + (ex.amount || 0), 0);

        setTotals({
          bills: totalBills,
          billPayments: totalBillPayments,
          maintenance: totalMaintenance,
          maintenancePayments: totalMaintenancePayments,
          expenses: totalExpenses,
        });
      } catch (err) {
        console.error("Error fetching totals:", err);
      }
    };

    fetchTotals();
  }, []);

  // Prepare data for bar chart
  const chartData = [
    { name: "Bills", amount: totals.bills },
    { name: "Bill Payments", amount: totals.billPayments },
    { name: "Maintenance", amount: totals.maintenance },
    { name: "Maintenance Payments", amount: totals.maintenancePayments },
    { name: "Expenses", amount: totals.expenses },
  ];

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Vikasitha Dashboard</h1>

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

      {/* Totals Chart */}
      <div className="totals-chart">
        <h2>Overall Totals</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => new Intl.NumberFormat().format(value)} />
            <Bar dataKey="amount" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
