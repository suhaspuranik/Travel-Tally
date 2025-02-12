import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Tripmates from './Tripmates';
import Itinerary from './Itinerary';

const TripDetails = () => {
    const { tripId } = useParams(); // Get tripId from the URL
    const navigate = useNavigate();

    const [reloadItinerary, setReloadItinerary] = useState(false);

    const handleDatesChange = () => {
        // Trigger a re-fetch of itinerary when dates change
        setReloadItinerary(prev => !prev);
    };
    return (
        <section className="trip-details-section">
            <Overview
                tripId={tripId}
                onDatesChange={handleDatesChange}
            />

            <Tripmates
                tripId={tripId}
            />

            <Itinerary
                tripId={tripId}
                reload={reloadItinerary}
            />

        </section>
    );
};

export default TripDetails;
