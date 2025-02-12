import React, { useState, useEffect } from 'react';
import styles from '../../styles/tripmatesDetails.module.css';
const Tripmates = ({ tripId }) => {
    const [tripMates, setTripMates] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [showDropdown, setShowDropdown] = useState(null);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [message, setMessage] = useState("");

    // Fetch tripmates and friends list when component mounts
    useEffect(() => {
        const fetchTripmatesAndFriends = async () => {
            try {
                const tripmatesResponse = await fetch(`http://localhost:5000/trips/get-tripmates/${tripId}`, {
                    method: "GET",
                    credentials: "include", // Include cookies for authentication
                });

                const friendsResponse = await fetch(`http://localhost:5000/profile/get-friends`, {
                    method: "GET",
                    credentials: "include",
                });

                if (tripmatesResponse.ok && friendsResponse.ok) {
                    const tripmatesData = await tripmatesResponse.json();
                    const friendsData = await friendsResponse.json();
                    setTripMates(tripmatesData.tripMates || []);
                    setFriendsList(friendsData.friends || []);
                } else {
                    console.error("Failed to fetch tripmates or friends list");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchTripmatesAndFriends();
    }, [tripId]);

    // Handle adding a new tripmate input field
    const addTripMate = () => {
        setTripMates([...tripMates, ""]); // Add an empty string for new tripmate input
    };

    // Handle input change for tripmate
    const handleTripMateInput = (index, value) => {
        const newTripMates = [...tripMates];
        newTripMates[index] = value;
        setTripMates(newTripMates);

        // Filter friends list based on the input value for suggestions
        const filtered = friendsList.filter(friend => friend.toLowerCase().includes(value.toLowerCase()));
        setFilteredFriends(filtered);

        // Show dropdown when user types in the input field
        if (filtered.length > 0 && value) {
            setShowDropdown(index);
        } else {
            setShowDropdown(null);
        }
    };

    // Handle selecting a friend from the dropdown
    const handleSelectFriend = (index, friend) => {
        const newTripMates = [...tripMates];
        newTripMates[index] = friend;
        setTripMates(newTripMates);
        setShowDropdown(null); // Close dropdown after selection
    };

    // Remove a tripmate
    const removeTripMate = (index) => {
        const newTripMates = tripMates.filter((_, i) => i !== index);
        setTripMates(newTripMates);
    };

    // Handle form submission to invite tripmates
    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:5000/trips/edit-tripmates/${tripId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tripMates }),
                credentials: "include", // Include cookies for authentication
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Tripmates updated successfully!');
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error inviting tripmates:', error);
        }
    };

    return (
        <div className="bodyDiv">
        <div className={styles.tripmatesContainer}>
            <div className={styles.tripmatesHeader}>
            <h2>Travel Companions</h2>
            <button type='button' className={styles.inviteButton} onClick={addTripMate}>+ Invite Tripmates</button>
            </div>
            <div className={styles.inviteSection}>
                {tripMates.map((tripMate, index) => (
                    <div className={styles.tripmateInput} key={index}>
                        <input
                            type="email"
                            className={styles.inputField}
                            placeholder="Enter tripmate's email"
                            value={tripMate}
                            onChange={(e) => handleTripMateInput(index, e.target.value)} // Handle tripMate input and show suggestions
                            onFocus={() => setShowDropdown(index)} // Show dropdown on focus
                            required
                        />
                        {tripMates.length > 1 && (
                            <button
                                className={styles.removeTripmate}
                                onClick={() => removeTripMate(index)}
                            >
                                &times;
                            </button>
                        )}
                        {/* Dropdown suggestions for friends */}
                        {showDropdown === index && filteredFriends.length > 0 && (
                            <ul className={styles.matesDropdown}>
                                {filteredFriends.map((friend, i) => (
                                    <li key={i} onClick={() => handleSelectFriend(index, friend)}>
                                        {friend}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
            <button className={styles.submitTripmates} onClick={handleSubmit}>Save Tripmates</button>
            {message && <p className="message">{message}</p>}
        </div>
        </div>
    );
};

export default Tripmates;
