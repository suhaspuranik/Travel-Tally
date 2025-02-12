import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import "../../styles/Auth.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the URL contains a message query parameter
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get("message");
    if (errorMessage) {
      setMessage(errorMessage);
    }
  }, []);

  // Show and Hide password
  const [showPassword, setShowPassword] = useState(false); // to toggle password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = "/UserHome";
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:5000/api/auth/google?action=login`;
  };

  const navigateSignup = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleGoBack = () => {
    navigate("/"); // Navigate to the previous page
  };

  return (
    <div className="main">
      <div className="backContainer">
        <button className="backButton" onClick={handleGoBack}>
          <img
            src="./images/back.png" // Replace this with the path to your logo
            alt="back"
            className="back"
          />
          Back
        </button>
      </div>
      <div className="container">
        <h1 className="heading">Login</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="inputGroup">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="inputGroup">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
            <span className="passToggle" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <FaEyeSlash className="hidepass" />
              ) : (
                <FaEye className="showpass" />
              )}
            </span>
          </div>
          <button
            type="button"
            className="forgotpass"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </button>
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button onClick={handleGoogleLogin} className="googleButton">
          <FcGoogle className="googleIcon" /> &nbsp; Login with Google
        </button>
        {message && <p className="message">{message}</p>}

        <p className="signup">
          Don't have an account? &nbsp;
          <button className="signupButton" onClick={navigateSignup}>
            Signup
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
