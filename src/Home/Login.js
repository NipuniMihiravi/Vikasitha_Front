import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AppHome.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!username || !password) {
      setMessage("⚠️ Please fill in all fields.");
      setMessageType("error");
      return;
    }

    // ✅ Admin login
    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("userRole", "admin");
      setMessage("✅ Login successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => navigate("/main"), 1000);
      return;
    }

    // ✅ User login
    if (username === "user" && password === "user123") {
      sessionStorage.setItem("userRole", "user");
      setMessage("✅ Login successful! Redirecting to mobile dashboard...");
      setMessageType("success");

      setTimeout(() => navigate("mobiledash"), 1000);
      return;
    }

    // ❌ Invalid credentials
    setMessage("❌ Invalid username or password.");
    setMessageType("error");
  };

  return (
    <div className="login-container2">
      <div className="login-container">
        <h1 className="title">විකසිත ප්‍රජා මූල සංවිධානය</h1>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button type="submit">Login</button>
        </form>

        {message && (
          <p className={`message ${messageType}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
