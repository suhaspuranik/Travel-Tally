import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
import { useNavigate } from "react-router-dom";
import styles from '../../styles/Itinerary.module.css';


const Itinerary = ({ tripId, reload }) => {
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);
    const [newActivity, setNewActivity] = useState({
        name: '',
        description: '',
        time: '',
    });
    const navigate = useNavigate();

    // Fetch itinerary from the database
    useEffect(() => {
        const fetchItinerary = async () => {
            try {
                const response = await fetch(`http://localhost:5000/trips/get-itinerary/${tripId}`, {
                    method: 'GET',
                    credentials: 'include', // Ensure cookies are sent for authentication
                });

                if (response.ok) {
                    const data = await response.json();
                    setItinerary(data || []); // Ensure itinerary is an array
                } else {
                    console.error('Failed to fetch itinerary');
                    setItinerary([]); // If failed, set as empty array
                }
            } catch (error) {
                console.error('Error fetching itinerary:', error);
                setItinerary([]); // In case of error, set as empty array
            } finally {
                setLoading(false);
            }
        };

        fetchItinerary();
    }, [tripId, reload]);

    const handleAddActivityClick = (dayIndex) => {
        // Set the selected day for adding an activity
        setSelectedDayIndex(dayIndex);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDayIndex(null);
        setNewActivity({ name: '', description: '', time: '' });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/trips/add-activity/${tripId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    dayIndex: selectedDayIndex,
                    activity: newActivity,
                }),
            });

            if (response.ok) {
                // Successfully added the activity
                const updatedItinerary = await response.json();
                setItinerary(updatedItinerary); // Update the itinerary with the new activity
                handleCloseModal();
            } else {
                console.error('Failed to add activity');
            }
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    };

    const handleDeleteActivity = async (dayIndex, activityIndex) => {
        try {
            const response = await fetch(`http://localhost:5000/trips/delete-activity/${tripId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    dayIndex,
                    activityIndex,
                }),
            });

            if (response.ok) {
                // Successfully deleted the activity
                const updatedItinerary = await response.json();
                setItinerary(updatedItinerary); // Update the itinerary after deletion
            } else {
                console.error('Failed to delete activity');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
    };

    if (loading) {
        return <div>Loading itinerary...</div>;
    }

    return (
        <div className='bodyDiv'>
       
        <div className={styles.itineraryContainer}>
            <h2 className={styles.itineraryHeading}>Itinerary</h2>
            {itinerary.length > 0 ? (
                <div className={styles.timeline}>
                    {itinerary.map((day, index) => (
                        <div key={index} className={styles.timelineItem}>
                            <div className={styles.timelineContent}>
                                <h3 className={styles.itineraryDate}>{day.day}</h3>
                                <ul>
                                    {day.activities.length > 0 ? (
                                        day.activities
                                            .map((activity, activityIndex) => ({
                                                ...activity,
                                                originalIndex: activityIndex // Store the original index
                                            }))
                                            .sort((a, b) => a.time.localeCompare(b.time)) // Sort activities by time
                                            .map((activity, sortedIndex) => (
                                                <li key={sortedIndex} className={styles.activityItem}>
                                                    <strong>{activity.name}</strong> at {activity.time}:<span className={styles.description}> {activity.description}</span>
                                                    <FaTrash
                                                        className={styles.deleteIcon}
                                                        onClick={() => handleDeleteActivity(index, activity.originalIndex)} // Pass the original index
                                                    />
                                                </li>
                                            ))
                                    ) : (
                                        <li className={styles.noActivity}>No activities added yet for this day.</li>
                                    )}
                                </ul>
                                <button className={styles.addButton} onClick={() => handleAddActivityClick(index)}>Add New Activity</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.noItinerary}>No itinerary found for this trip.</div>
            )}

            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Add New Activity</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className={styles.activityFormGroup}>
                                <label htmlFor="name">Activity Name:</label>
                                <input
                                    type="text"
                                    id="name"

                                    value={newActivity.name}
                                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.activityFormGroup}>
                                <label htmlFor="description">Description:</label>
                                <input
                                    type="text"
                                    id="description"
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.activityFormGroup}>
                                <label htmlFor="time">Time:</label>
                                <input
                                    type="time"
                                    id="time"
                                    value={newActivity.time}
                                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.activitybtn}>
                            <button className={styles.submitButton} type="submit">Add Activity</button>
                            <button className={styles.cancelButton} type="button" onClick={handleCloseModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default Itinerary;