import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import "../../styles/PasswordStyles.css";
import "../../styles/Auth.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  // Initialize the navigate function
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMessage("❌ Passwords do not match");
    }

    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        // Redirect to the login page after successful reset
        setTimeout(() => {
          navigate("/login");
        }, 1000); // Redirect after 2 seconds
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="main">
        <div className="backContainer">
        <button className="backButton" onClick={() => navigate("/login")}>
          <img
            src="./images/back.png" // Replace this with the path to your logo
            alt="back"
            className="back"
          />
          Back
        </button>
      </div>
    <div className="container">
      <h1 className="heading">Reset Password</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
            title="Password must contain at least 8 characters and at least one uppercase, lowercase, number, and special character"
            required
          />
        </div><br/>
        <div className="reset-input-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
          />
        </div><br/>
        <button type="submit" className="button">
          Reset Password
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
    </div>
  );
}

export default ResetPassword;
