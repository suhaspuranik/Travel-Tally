import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import "../../styles/Home.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../navbar/Navbar";
import ProfileDialog from "../profile/Profile";

const Home = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigateLogin = () => {
    navigate("/login");
  };

  const navigateSignup = () => {
    navigate("/dashboard");
  };

  const navigatePlanTrip = () => {
    navigate("/plan-new-trip");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false); // Close the menu if the screen is resized to desktop view
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="home-container">
      <nav className="homeNavbar"></nav>
      <Navbar
        toggleMenu={toggleMenu}
        menuOpen={menuOpen}
        setShowProfile={() => setShowProfile(true)} // Open the profile dialog
      />
      {/* Profile Dialog */}
      {showProfile && (
        <ProfileDialog
          show={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      <div className="bodyDiv">
        <header className="header">
          <h1>
            TravelTally
            <img
              className="headingImg"
              src="images/passenger.png"
              alt="Real-Time Reminders"
            />
          </h1>

          <p>Your Ultimate Trip Companion.</p>
          <button onClick={navigatePlanTrip} className="plan-button">
            Plan a New Trip
          </button>
        </header>

        <section className="intro">
          <h2>One Stop Solution for All Your Trip Expenses</h2>
          <p>
            Planning a trip has never been easier! With TravelTally, you can
            effortlessly manage all your trip expenses—be it a family vacation,
            a fun getaway with friends, or a business trip. Organize, track, and
            collaborate on one simple platform.
          </p>
        </section>

        <section className="features">
          <h2>Why TravelTally?</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <img src="images/balance.gif" alt="Split Costs" />
              <h3>Split Costs Effortlessly</h3>
              <p>
                Share your trip with others and track who owes whom with ease.
              </p>
            </div>

            <div className="feature-card">
              <img src="/images/sharing.gif" alt="Share " />
              <h3>Share in Real-Time</h3>
              <p>
                Collaborate with friends or family and organize your trip budget
                together in real time.
              </p>
            </div>
            <div className="feature-card">
              <img src="/images/accounting.gif" alt="Expense" />
              <h3>Seamless Expense Tracking</h3>
              <p>
                Capture and categorize your expenses quickly—whether it's a
                single day or the entire trip.
              </p>
            </div>
            <div className="feature-card">
              <img src="images/budget.gif" alt="Stay on Budget" />
              <h3>Stay on Budget</h3>
              <p>
                Set a budget and let TravelTally help you save money by keeping
                track of every penny spent.
              </p>
            </div>
          </div>
        </section>
        <section className="key-features-circle">
          <h2>Key Features</h2>
          <div className="feature-cards-circle">
            <div className="feature-card-circle">
              <div className="circle">
                <img src="images/cash-flow.png" alt="Quick Expense Entry" />
              </div>
              <div className="content">
                <h3>Quick Expense Entry</h3>
                <p>
                  Add expenses in seconds, categorize them, and tie them to
                  specific locations or dates.
                </p>
              </div>
            </div>
            <div className="feature-card-circle">
              <div className="circle">
                <img src="images/united.png" alt="Collaborative Budgeting" />
              </div>
              <div className="content">
                <h3> Collaborative Budgeting</h3>
                <p>
                  Invite friends or family to track expenses together. Everyone
                  can log their contributions.
                </p>
              </div>
            </div>
            <div className="feature-card-circle">
              <div className="circle">
                <img
                  src="images/budget.png"
                  alt="Automated Expense Breakdown"
                />
              </div>
              <div className="content">
                <h3>Automated Expense Breakdown</h3>
                <p>
                  Get a clear breakdown of your expenses by category, person, or
                  activity.
                </p>
              </div>
            </div>
            <div className="feature-card-circle">
              <div className="circle">
                <img src="images/reminder.png" alt="Real-Time Reminders" />
              </div>
              <div className="content">
                <h3>Real-Time Reminders</h3>
                <p>
                  Never miss important deadlines with timely notifications for
                  bookings and payments.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <h2>Already started trip?</h2>
          <p>
            Take Control of Your Travel Budget Today!
            <br /> Look into your dashboard and add your expenses now !!
          </p>
          <div className="home-buttons">
            <button onClick={navigateSignup} className="signup-btn">
              View My Trips
            </button>
          </div>
        </section>
      </div>
      <footer className="footer">
        <p>© 2025 TravelTally. All Rights Reserved.</p>
        <br />
        <section className="contact-section">
          <h3>Need Help? Contact Us!</h3>
          <p>If you have any questions, feel free to reach out to us!</p>
          <a href="mailto:help.traveltally@gmail.com" className="footer-email">
            <Mail size={18} className="footer-icon" />{" "}
            help.traveltally@gmail.com
          </a>
        </section>

        {/*   */}
      </footer>
    </div>
  );
};

export default Home;



