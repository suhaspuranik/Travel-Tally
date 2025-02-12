import { FcGoogle } from "react-icons/fc";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../styles/Auth.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //For user already exists for Google auth
  useEffect(() => {
    // Check if the URL contains a message query parameter
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get("message");
    if (errorMessage) {
      setMessage(errorMessage);
    }
  }, []);

  // For show password
  const [showPassword, setShowPassword] = useState(false); // to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // FOr show cpassword
  const [showcPassword, setShowcPassword] = useState(false); // to toggle password visibility
  const togglecPasswordVisibility = () => {
    setShowcPassword(!showcPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = "/login";
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
    // Redirect user to Google OAuth route
    window.location.href = `http://localhost:5000/api/auth/google?action=register`;
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
        <h1 className="heading">Register</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="inputGroup">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>
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
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
              title="Password must contain at least 8 characters and at least one uppercase, lowercase, number, and special character"
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
          <div className="inputGroup">
            <input
              type={showcPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
            <span className="passToggle" onClick={togglecPasswordVisibility}>
              {showcPassword ? (
                <FaEyeSlash className="hidepass" />
              ) : (
                <FaEye className="showpass" />
              )}
            </span>
          </div>
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Google OAuth Button */}
        <div className="googleButtonContainer">
          <button className="googleButton" onClick={handleGoogleLogin}>
            <FcGoogle className="googleIcon" /> &nbsp; Register with Google
          </button>
        </div>
        {message && <p className="message">{message}</p>}

        <p className="signin">
          Already have an account? &nbsp;
          <Link to="/login" className="signinButton">
            Signin
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
