import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import "../../styles/PasswordStyles.css";
import "../../styles/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored timer on page load
    const storedEndTime = localStorage.getItem("forgotPasswordEndTime");
    if (storedEndTime) {
      const endTime = new Date(storedEndTime);
      if (!isNaN(endTime)) {
        const remainingTime = Math.floor((endTime - new Date()) / 1000);
        if (remainingTime > 0) {
          setTimer(remainingTime);
          setSubmitDisabled(true);
        } else {
          localStorage.removeItem("forgotPasswordEndTime");
        }
      }
    }
  }, []);

  useEffect(() => {
    // Start countdown for timer
    let timerInterval;
    if (timer > 0) {
      timerInterval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setSubmitDisabled(false);
      localStorage.removeItem("forgotPasswordEndTime");
    }
    return () => clearInterval(timerInterval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setSubmitDisabled(true);
        const endTime = new Date(new Date().getTime() + 120 * 1000); // 2 minutes from now
        localStorage.setItem("forgotPasswordEndTime", endTime);
        setTimer(120);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
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
        <h1 className="heading">Forgot Password</h1>
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
                <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div><br/>
            <button
              type="submit"
              className="button"
              disabled={loading || submitDisabled}
            >{loading
              ? "Submitting..."
              : submitDisabled
              ? `Wait ${timer}s to try again`
              : "Submit"}
            </button>
          </form>
          {message && <p className="message">{message}</p>}

      </div>
    </div>
   
  );
}

export default ForgotPassword;
