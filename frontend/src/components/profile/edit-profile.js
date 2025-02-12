import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { FaCamera, FaUser, FaEnvelope } from "react-icons/fa";
import "../../styles/ProfileEdit.css";

function EditProfile({ show, onClose, profile, onSave, token }) {
  const navigate = useNavigate();

  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordChangeEnabled, setIsPasswordChangeEnabled] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfilePic(profile.profilePic_url || "../images/dummyProfile.svg");
      setName(profile.name);
    }
  }, [profile]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (isPasswordChangeEnabled && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const updatedData = {
      name,
      email: profile.email,
      profilePic_url: profilePic,
      password: password || profile.password,
    };

    try {
      const response = await fetch("http://localhost:5000/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to update profile");
        return;
      }

      const updatedProfile = await response.json();
      onSave(updatedProfile);
      onClose();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const togglePasswordChange = () => {
    setIsPasswordChangeEnabled(!isPasswordChangeEnabled);
    setPassword("");
    setConfirmPassword("");
  };

  if (!show || !profile) return null;

  return (
    <div className="profile-edit-overlay">
      <div className="profile-edit-dialog">
        <button className="close-button" onClick={onClose}>
          <IoIosClose />
        </button>
        <h2>Edit Profile</h2>
        {/* Profile Picture Upload Section */}
        <div className="profile-pic-edit">
          <div className="profile-pic-container">
            <img className="profile-pic" src={profilePic} alt="Profile" />
            <label htmlFor="file-upload" className="camera-icon">
              <FaCamera className="camera-icon-inside" />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
        {/* Name and Email Display */}

        <div className="profile-info">
          <div className="profile-info-field">
            <FaUser className="profile-icon" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div className="profile-info-field">
            <FaEnvelope className="profile-icon" />
            <input type="email" value={profile.email} disabled />
          </div>
        </div>
        {/* Password Change Toggle */}
        <div className="password-toggle">
          <button
            type="button"
            onClick={togglePasswordChange}
            className="toggle-password-button"
          >
            {isPasswordChangeEnabled ? "Cancel Change" : "Change Password"}
          </button>
        </div>
        {/* Password Change Inputs */}
        {isPasswordChangeEnabled && (
          <>
            <div className="password-edit">
              <label>New Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                title="Password must contain at least 8 characters and at least one uppercase, lowercase, number, and special character"
              />
            </div>
            <div className="password-edit">
              <label>Confirm Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </>
        )}
        {/* Save Button */}
        <button className="save-button" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default EditProfile;
