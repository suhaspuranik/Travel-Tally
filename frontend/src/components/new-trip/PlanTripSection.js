import React, { useState, useEffect } from "react";
import "../../styles/PlanTripSection.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const PlanTripSection = ({
  tripMates,
  addTripMate,
  handleTripMateChange,
  removeTripMate,
}) => {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [friends, setFriends] = useState([]); // State to store the user's friends
  const [filteredFriends, setFilteredFriends] = useState([]); // State to store filtered friends for dropdown
  const [showDropdown, setShowDropdown] = useState(-1); // State to track which input is focused (index)
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  // Fetch friends on mount
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/profile/get-friends",
          {
            credentials: "include",
            method: "GET",
          }
        );
        const result = await response.json();
        if (response.ok) {
          setFriends(result.friends); // Store friends in state
        } else {
          console.error("Failed to fetch friends");
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    fetchFriends();

    // Check if the URL contains a message query parameter
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get("message");
    if (errorMessage) {
      setMessage(errorMessage);
    }
  }, []);

  // Handle the dropdown logic when user types in tripMate input
  const handleTripMateInput = (index, value) => {
    handleTripMateChange(index, value);

    // Filter the friends list based on user input
    const filtered = friends.filter((friend) =>
      friend.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredFriends(filtered);
    setShowDropdown(index); // Show the dropdown for the focused input
  };

  // Handle selecting a friend from the dropdown
  const handleSelectFriend = (index, friendEmail) => {
    handleTripMateChange(index, friendEmail); // Set the selected email
    setShowDropdown(-1); // Hide the dropdown
  };

  // Close the dropdown when clicking outside the input and dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".tripmate-input")) {
        setShowDropdown(-1); // Hide the dropdown if click is outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch("http://localhost:5000/trips/create-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          budget,
          tripMates, // This will send the array of tripMates
        }),
        credentials: "include", // Include cookies (for authentication)
      });
      const result = await response.json();
      if (response.ok) {
        setMessage("Trip created successfully");
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage("Error creating trip:", error);
    } finally {
      setIsLoading(false); // Reset loading state after process finishes
    }
  };

  return (
    <section className="plan-trip-section" id="plan-trip-section">
      <h2 className="plan-trip-heading">Plan New Trip</h2>
 
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label className="floating-label">Destination</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        <div className="input-container-inline">
          <div className="input-container">
            <label className="floating-label">Start Date</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              min={new Date().toISOString().split("T")[0]} // Set the minimum selectable date to today
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <label className="floating-label">End Date</label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              min={startDate || new Date().toISOString().split("T")[0]} // Ensure the end date is after the start date
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-container">
          <label className="floating-label">Budget</label>
          <input
            type="number"
            className="input-field"
            placeholder="Enter estimated budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </div>

        <div className="invite-section">
          <button type="button" className="invite-button" onClick={addTripMate}>
            + Invite Tripmates
          </button>
          {tripMates.map((tripMate, index) => (
            <div className="tripmate-input" key={index}>
              <input
                type="email"
                className="input-field"
                placeholder="Enter tripmate's email"
                value={tripMate}
                onChange={(e) => handleTripMateInput(index, e.target.value)} // Handle tripMate input and show suggestions
                onFocus={() => setShowDropdown(index)} // Show dropdown on focus
                required
              />
              {tripMates.length > 1 && (
                <button
                  className="remove-tripmate"
                  onClick={() => removeTripMate(index)}
                >
                  &times;
                </button>
              )}
              {showDropdown === index && filteredFriends.length > 0 && (
                <ul className="dropdown">
                  {filteredFriends.map((friend, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectFriend(index, friend)}
                    >
                      {friend}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <p>Loading...</p>{" "}
            {/* You can replace this with a spinner or more dynamic loading effect */}
          </div>
        ) : (
          <button type="submit" className="go-button">
            Let's Go!
          </button>
        )}

        {message && <p className="message">{message}</p>}
      </form>
    </section>
  );
};

export default PlanTripSection;
