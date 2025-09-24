// src/pages/Dashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info("🚪 Logged out successfully!");
    navigate("/");
  };

  return (
    <div className="container">
      <h2 className="heading">👤 Dashboard</h2>
      {user ? (
        <div className="loggedInBox">
          <p>Welcome, {user.username}!</p>
          <button className="button" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
}

export default Dashboard;
