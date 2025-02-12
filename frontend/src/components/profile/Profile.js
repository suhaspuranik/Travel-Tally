import React, { useEffect, useState } from "react";
import "../../styles/Profile.css";

import { IoIosClose } from "react-icons/io";
import { FaPencilAlt } from "react-icons/fa";
import EditProfile from "./edit-profile"; // Import EditProfile component

function Profile({ show, onClose }) {
  const [profile, setProfile] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false); // Manage EditProfile modal visibility

  // Fetch profile data from the backend
  useEffect(() => {
    if (show) {
      const fetchProfile = async () => {
        try {
          const response = await fetch("http://localhost:5000/profile/get-profile", {
            method: "GET",
            credentials: "include", // Include cookies for authentication
          });

          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          } else {
            console.error("Failed to fetch profile data");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };

      fetchProfile();
    }
  }, [show]);

  // Do not render if `show` is false or profile data is not fetched
  if (!show || !profile) return null;

  const handleEditProfile = () => {
    setShowEditProfile(true); // Show EditProfile modal
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false); // Close EditProfile modal
  };

  const handleSaveProfile = async (updatedProfile) => {
    setShowEditProfile(false); // Close the EditProfile modal
    // Refetch profile data to update UI
    try {
      const response = await fetch("http://localhost:5000/profile/get-profile", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data); // Update profile with new data
      } else {
        console.error("Failed to fetch updated profile data");
      }
    } catch (error) {
      console.error("Error fetching updated profile:", error);
    }
  };

  return (
    <div className="profile-dialog-overlay">
      <div className="profile-dialog">
        <button className="close-button" onClick={onClose}>
          <IoIosClose />
        </button>
        <div className="profile-header">
          <h1>{profile.name}</h1>
        </div>
        <div className="profile-pic-container">
          <img
            className="profile-pic"
            src={profile.profilePic_url || "../images/dummyProfile.svg"}
            alt="Profile"
          />
        </div>
        <div className="profile-details">
          <span className="profile-email">{profile.email}</span>
          <button onClick={handleEditProfile} className="edit-profile-button">
            <FaPencilAlt className="edit-icon" /> Edit
          </button>
        </div>
      </div>

      {/* Display EditProfile modal if showEditProfile is true */}
      {showEditProfile && (
        <EditProfile
          show={showEditProfile}
          onClose={handleCloseEditProfile}
          profile={profile}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}

export default Profile;
