import React, { useState } from "react";
import Navbar from "../navbar/Navbar";
import UpcomingTrips from "./UpcomingTrips";
import ProfileDialog from "../profile/Profile";
import "../../styles/Dashboard.css";

const Dashboard = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  function handleShowProfile() {
    return setShowProfile(true);
  }

  return (
    <>
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

      <div className="dashboard-container">
        <div className="content">
          <UpcomingTrips />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
