import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripOverview,
  updateTripOverview,
  getTripMates,
  updateTripMates,
  getItinerary,
  addActivityToItinerary,
  deleteActivity,
} from "../controllers/tripController.js";
import verifyToken from "../middleware/verifyToken.js"; // Import the middleware

const router = Router();

// Use the verifyToken middleware for the /create-trip route
router.post("/create-trip", verifyToken, createTrip);
router.get("/get-trips", verifyToken, getTrips);

router.get("/get-overview/:tripId", verifyToken, getTripOverview);
router.put("/update-overview/:tripId", verifyToken, updateTripOverview);

router.get("/get-tripmates/:tripId", verifyToken, getTripMates);
router.post("/edit-tripmates/:tripId", verifyToken, updateTripMates);

router.get("/get-itinerary/:tripId", verifyToken, getItinerary);

router.post("/add-activity/:tripId", verifyToken, addActivityToItinerary);
router.post("/delete-activity/:tripId", verifyToken, deleteActivity);

export default router;
