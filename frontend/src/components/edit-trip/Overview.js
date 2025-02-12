import React, { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import ProfileDialog from "../profile/Profile";
import { FaPencilAlt , FaPlus} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/TripOverview.module.css";

// Helper function to format the date as dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to convert date to yyyy-mm-dd format for input fields
const formatForInput = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Overview = ({ tripId, onDatesChange }) => {
  const [tripOverview, setTripOverview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedOverview, setUpdatedOverview] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
  });
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  function handleShowProfile() {
    return setShowProfile(true);
  }

  // Fetch trip overview data
  useEffect(() => {
    if (tripId) {
      const fetchTripOverview = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/trips/get-overview/${tripId}`,
            {
              method: "GET",
              credentials: "include", // Include cookies for authentication
            }
          );

          if (response.ok) {
            const data = await response.json();
            setTripOverview(data);
            setUpdatedOverview({
              destination: data.destination,
              startDate: formatForInput(data.startDate),
              endDate: formatForInput(data.endDate),
              budget: data.budget,
            });
          } else {
            console.error("Failed to fetch trip overview");
          }
        } catch (error) {
          console.error("Error fetching trip overview:", error);
        }
      };

      fetchTripOverview();
    }
  }, [tripId]);

  // Toggle between edit and view modes
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOverview((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Save (Update) action
  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/trips/update-overview/${tripId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedOverview),
          credentials: "include", // Include cookies for authentication
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTripOverview(data); // Update the overview with the new values
        setIsEditing(false); // Exit edit mode
        if (onDatesChange) {
          onDatesChange();
        }
      } else {
        console.error("Failed to update trip overview");
      }
    } catch (error) {
      console.error("Error updating trip overview:", error);
    }
  };

  const hasTripStarted =
    tripOverview && new Date() > new Date(tripOverview.startDate);

  if (!tripOverview) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Navbar
        toggleMenu={toggleMenu}
        menuOpen={menuOpen}
        setShowProfile={() => setShowProfile(true)} // Open the profile dialog
      />
      {showProfile && (
        <ProfileDialog
          show={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      <div className="bodyDiv">
        <div className={styles.overviewContainer}>
          
            

            {isEditing ? (
               <div className={styles.tripOverviewCard}>
              <h2> Edit Trip</h2>
              <div className={styles.editOverviewContainer}>
                <div className={styles.editFormGroup}>
                  <label>Destination:</label>
                  <input
                    type="text"
                    name="destination"
                    maxLength="20"
                    value={updatedOverview.destination}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.editFormGroup}>
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="startDate"
                    min={new Date().toISOString().split("T")[0]} // Set the minimum selectable date to today
                    value={updatedOverview.startDate}
                    onChange={handleChange}
                    disabled={hasTripStarted}
                  />
                </div>
                
                <div className={styles.editFormGroup}>
                  <label>End Date:</label>
                  <input
                    type="date"
                    name="endDate"
                    min={
                      updatedOverview.startDate ||
                      new Date().toISOString().split("T")[0]
                    } // Ensure the end date is after the start date
                    value={updatedOverview.endDate}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.editFormGroup}>
                  <label>Budget:</label>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    value={updatedOverview.budget}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.overviewButtons}>
                <button className={styles.editSavebtn} onClick={handleSave}>
                  Save
                </button>
                <button
                 className={styles.editCancelbtn}
                  onClick={handleEditToggle}
                >
                  Cancel
                </button>
                </div>
              </div>
              </div>
            ) : (
              <div className={styles.tripOverviewCard}>
              <h2> Overview</h2>
              <div className="overview-details">
                <p>
                  <strong>Destination:</strong> {tripOverview.destination}
                </p>
                <div className={styles.startEndDate}>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {formatDate(tripOverview.startDate)}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {formatDate(tripOverview.endDate)}
                  </p>
                </div>
                <p>
                  <strong>Budget:</strong> ₹ {tripOverview.budget}
                </p>
                <div className={styles.overviewButtons}>
                  <button
                    className={styles.editButton}
                    onClick={handleEditToggle}
                  >
                    <FaPencilAlt />&nbsp;&nbsp;Edit
                  </button>
                  <button
                    type="button"
                    className={styles.addExpenseButton}
                    onClick={() => navigate(`/trips/${tripId}/expenses`)}
                  >
                    <FaPlus />&nbsp;&nbsp;Add Expense
                  </button>
                </div>
              </div>
              </div>
            )}
          </div>
       
      </div>
    </>
  );
};

export default Overview;
