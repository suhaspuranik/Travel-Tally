import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, TrashIcon } from "lucide-react"; // Icons
import { FaRupeeSign } from "react-icons/fa";
import styles from "../../styles/UpcomingTrips.module.css";

const UNSPLASH_ACCESS_KEY = "d7ctCPDT5DFqPALl3BdLR9uXi7-fDsk32wCKO8EWb5E";

const UpcomingTrips = () => {
  const [trips, setTrips] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const ongoingScrollRef = useRef(null);
  const upcomingScrollRef = useRef(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:5000/trips/get-trips", {
          method: "GET",
          credentials: "include", // If authentication is needed
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "Failed to fetch trips");
          return;
        }

        const data = await response.json();
        const updatedTrips = await Promise.all(
          data.map(async (trip) => {
            if (!trip.image) {
              const imageUrl = await fetchUnsplashImage(trip.destination);
              return { ...trip, image: imageUrl };
            }
            return trip;
          })
        );
        setTrips(
          updatedTrips.sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
          )
        );
      } catch (error) {
        setErrorMessage("Failed to connect to the server. Please try again.");
      }
    };

    fetchTrips();
  }, []);

  const fetchUnsplashImage = async (destination) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${destination}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
      );
      const data = await response.json();
      return data.results[0]?.urls?.regular || "images/defaultImage.jpeg";
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
      return "images/defaultImage.jpeg";
    }
  };

  const viewTripDetails = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  const scrollLeft = (ref) => {
    ref.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = (ref) => {
    ref.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const getOngoingTrips = () => {
    const today = new Date();
    return trips.filter((trip) => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      return startDate <= today && endDate >= today;
    });
  };

  const getUpcomingTrips = () => {
    const today = new Date();
    return trips.filter((trip) => new Date(trip.startDate) > today);
  };

  //delete trip
  const handleExitTrip = async (tripId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/trips/${tripId}/exit`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("You have exited the trip successfully!");
        navigate("/dashboard"); // Reload trips after exiting
      } else {
        const errorData = await response.json();
        alert(`Failed to exit the trip: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error exiting trip:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className={styles.Upcomingcontainer}>
      <h2 className={styles.Upcomingheading}>Ongoing Trips</h2>
      <div className={styles.Upcomingcarousel}>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {getOngoingTrips().length === 0 ? (
          <p>No ongoing trips found.</p>
        ) : (
          <>
            <button
              className={styles.UpcomingarrowLeft}
              onClick={() => scrollLeft(ongoingScrollRef)}
            >
              <ChevronLeft />
            </button>
            <div className={styles.UpcomingtripList} ref={ongoingScrollRef}>
              {getOngoingTrips().map((trip) => (
                <div
                  key={trip._id}
                  className={styles.UpcomingtripCard}
                  onClick={() => viewTripDetails(trip._id)}
                >
                  <div className={styles.UpcomingcardHeader}>
                    <h3 className={styles.Upcomingdestination}>
                      {trip.destination}
                    </h3>
                  </div>
                  <div className={styles.UpcomingimageContainer}>
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className={styles.UpcomingtripImage}
                    />
                  </div>
                  <div className={styles.UpcomingtripDetails}>
                    <p>
                      <img
                        src="images/calendar.png"
                        alt="calendar"
                        className={styles.calender}
                      />{" "}
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      })}
                      {" - "}
                      {new Date(trip.endDate).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      })}
                      <span className={styles.budgetContainer}>
                        <FaRupeeSign className={styles.budgetIcon} />
                        {trip.budget}
                      </span>
                    </p>
                    <p className={styles.tripDetails}>
                      <span className={styles.tripMates}>
                        <img
                          src="images/group.png"
                          alt="group"
                          className={styles.tripmatesimg}
                        />
                        {trip.tripMates.length} members
                      </span>
                      <div
                        className={styles.trashContainer}
                        onClick={() => handleExitTrip(trip._id)}
                      >
                        <div className={styles.trashContainer}>
                          <img
                            src="images/exiticon.png"
                            size={20}
                            className={styles.trashIcon}
                          />
                          <span className={styles.tooltip}>
                            Exit from the trip
                          </span>
                        </div>
                      </div>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className={styles.UpcomingarrowRight}
              onClick={() => scrollRight(ongoingScrollRef)}
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      <h2 className={styles.Upcomingheading}>Upcoming Trips</h2>
      <div className={styles.Upcomingcarousel}>
        {getUpcomingTrips().length === 0 ? (
          <p>No upcoming trips found.</p>
        ) : (
          <>
            <button
              className={styles.UpcomingarrowLeft}
              onClick={() => scrollLeft(upcomingScrollRef)}
            >
              <ChevronLeft />
            </button>
            <div className={styles.UpcomingtripList} ref={upcomingScrollRef}>
              {getUpcomingTrips().map((trip) => (
                <div
                  key={trip._id}
                  className={styles.UpcomingtripCard}
                  onClick={() => viewTripDetails(trip._id)}
                >
                  <div className={styles.UpcomingcardHeader}>
                    <h3 className={styles.Upcomingdestination}>
                      {trip.destination}
                    </h3>
                  </div>
                  <div className={styles.UpcomingimageContainer}>
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className={styles.UpcomingtripImage}
                    />
                  </div>
                  <div className={styles.UpcomingtripDetails}>
                    <p>
                      <img
                        src="images/calendar.png"
                        alt="calendar"
                        className={styles.calender}
                      />{" "}
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      })}
                      {" - "}
                      {new Date(trip.endDate).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      })}
                      <span className={styles.budgetContainer}>
                        <FaRupeeSign className={styles.budgetIcon} />
                        {trip.budget}
                      </span>
                    </p>
                    <p>
                      <img
                        src="images/group.png"
                        alt="group"
                        className={styles.tripmatesimg}
                      />{" "}
                      {trip.tripMates.length} members
                    </p>
                    <p className={styles.daysLeft}>
                      <span className={styles.daysText}>
                        {(() => {
                          const daysLeft = Math.ceil(
                            (new Date(trip.startDate) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          );

                          if (daysLeft === 1) {
                            return "Trip starts tomorrow !!";
                          } else {
                            return `${daysLeft} days to go !!`;
                          }
                        })()}
                      </span>
                      <div
                        className={styles.trashContainer}
                        onClick={() => handleExitTrip(trip._id)}
                      >
                        <div className={styles.trashContainer}>
                          <img
                            src="images/exiticon.png"
                            size={20}
                            className={styles.trashIcon}
                          />
                          <span className={styles.tooltip}>
                            Exit from the trip
                          </span>
                        </div>
                      </div>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className={styles.UpcomingarrowRight}
              onClick={() => scrollRight(upcomingScrollRef)}
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingTrips;
