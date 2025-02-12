import React, { useState } from "react";
import "../../styles/PlanNewTrip.css";
import ProfileDialog from "../profile/Profile";
import Navbar from "../navbar/Navbar";
import PlanTripSection from "./PlanTripSection";

function PlanNewTrip() {
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tripMates, setTripMates] = useState([""]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const addTripMate = () => setTripMates([...tripMates, ""]);
  const handleTripMateChange = (index, value) => {
    const updatedTripMates = [...tripMates];
    updatedTripMates[index] = value;
    setTripMates(updatedTripMates);
  };
  const removeTripMate = (index) => setTripMates(tripMates.filter((_, i) => i !== index));

  return (
    <div>
      {/* Navbar */}
      <Navbar
        toggleMenu={toggleMenu}
        menuOpen={menuOpen}
        setShowProfile={setShowProfile}
      />

      {/* Profile Dialog */}
      <ProfileDialog
        show={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Plan Trip Section */}
      <PlanTripSection
        tripMates={tripMates}
        addTripMate={addTripMate}
        handleTripMateChange={handleTripMateChange}
        removeTripMate={removeTripMate}
      />
    </div>
  );
}

export default PlanNewTrip;
