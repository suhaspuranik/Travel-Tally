import React, { useState, useEffect, useRef } from "react";
import AddTripmates from "../profile/AddTripmates";
import styles from "../../styles/Navbar.module.css"; // Importing the CSS module

const Navbar = ({ setShowProfile }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        !event.target.closest(`.${styles.userdropdownMenu}`) &&
        !event.target.closest(`.${styles.userprofileIcon}`)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      <nav className={styles.usernavbar}>
        {/* Large Screen Navbar */}
        <div className={styles.usernavbarLeft}>
          <img
            src={"/images/logofn.png"}
            alt="Logo"
            className={styles.TravelLogo}
          />
          <ul className={styles.usernavbarLinks}>
            <li>
              <a href="/UserHome">Home</a>
            </li>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li>
              <a href="/plan-new-trip">Plan New Trip</a>
            </li>
          </ul>
        </div>
        <div className={styles.usernavbarRight}>
          <div
            className={styles.userprofileIcon}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img src={"/images/user.png"} alt="Profile" />
          </div>
          {menuOpen && (
            <div
              className={styles.userdropdownMenu}
              onClick={(e) => e.stopPropagation()}
            >
              <ul>
                <li onClick={() => setShowProfile(true)}>Your Profile</li>
                <li onClick={() => setDialogOpen(true)}>Add Friends</li>
                <li>
                  <a href="/history">History</a>
                </li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className={styles.usernavbarMobile}>
          <img
            src={"/images/logofn.png"}
            alt="TravelLogo"
            className={styles.TravelLogo}
          />
          <div
            className={styles.userprofileIcon}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img src={"/images/user.png"} alt="Profile" />
          </div>
          {menuOpen && (
            <div className={styles.userdropdownMenu} ref={dropdownRef}>
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/dashboard">Dashboard</a>
                </li>
                <li>
                  <a href="/plan-new-trip">Plan New Trip</a>
                </li>
                <li onClick={() => setShowProfile(true)}>Your Profile</li>
                <li onClick={() => setDialogOpen(true)}>Add Tripmates</li>
                <li>
                  <a href="/history">History</a>
                </li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </nav>
      <AddTripmates isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default Navbar;
