import React, { useState, useEffect } from "react";
import styles from "../../styles/AddTripmates.module.css"; // Importing CSS module for dialog styling

const AddTripmates = ({ isOpen, onClose }) => {
  const [companionEmail, setCompanionEmail] = useState("");
  const [companions, setCompanions] = useState([]);
  const [error, setError] = useState(null); // To handle any errors from the server

  // Fetch user's friends list from the server when the component mounts
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/profile/get-friends",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setCompanions(data.friends || []); // Assuming `data.friends` is an array of emails
        } else {
          setError(data.message || "Failed to fetch friends list");
        }
      } catch (err) {
        console.error("Error fetching friends list:", err);
        setError("Something went wrong. Please try again later.");
      }
    };

    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]); // Re-fetch the friends list each time the dialog opens

  const handleAddCompanion = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    if (companionEmail.trim() && !companions.includes(companionEmail)) {
      try {
        const response = await fetch(
          "http://localhost:5000/profile/add-friends",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: companionEmail }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setCompanions([...companions, companionEmail]); // Add the email to the companions list
          setCompanionEmail(""); // Clear the input field
          setError(null); // Clear any previous error
        } else {
          setError(data.message || "Failed to add companion"); // Handle server error response
        }
      } catch (err) {
        console.error("Error adding companion:", err);
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  const handleRemoveCompanion = async (email) => {
    try {
      const response = await fetch(
        "http://localhost:5000/profile/remove-friend",
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }), // Send the email of the companion to remove
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the companions list in the frontend after successful removal
        setCompanions(companions.filter((companion) => companion !== email));
        setError(null); // Clear any error messages
      } else {
        setError(data.message || "Failed to remove companion"); // Handle error from server
      }
    } catch (err) {
      console.error("Error removing companion:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  if (!isOpen) {
    return null; // Do not render dialog if it's not open
  }

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogBox}>
        <h2 className={styles.dialogHeading}>Add Your Friends</h2>
        <form onSubmit={handleAddCompanion}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              placeholder="Enter companion's Gmail"
              value={companionEmail}
              onChange={(e) => setCompanionEmail(e.target.value)}
              className={styles.companionInput}
            />
            <button onClick={handleAddCompanion} className={styles.addButton}>
              Add
            </button>
          </div>
        </form>
        {error && <p className={styles.errorText}>{error}</p>}{" "}
        {/* Display error if any */}
        <div className={styles.companionList}>
          {companions.length > 0 ? (
            companions.map((email, index) => (
              <div key={index} className={styles.companionItem}>
                <span>{email}</span>
                <button
                  onClick={() => handleRemoveCompanion(email)}
                  className={styles.removeButton}
                >
                  <img
                    className={styles.deleteTripmateBtn}
                    src={"/images/dustbin.png"}
                    alt="Profile"
                  />
                </button>
              </div>
            ))
          ) : (
            <p className={styles.noCompanionsText}>No companions added yet.</p>
          )}
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AddTripmates;
