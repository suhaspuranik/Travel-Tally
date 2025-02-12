import Trip from "../models/Trip.js"; // Import the Trip model
import User from "../models/User.js";
import jwt from "jsonwebtoken"; // If you're using JWT for authentication
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import handlebars from "handlebars";
import moment from "moment"; // Use moment.js for date manipulation (make sure to install moment)

dotenv.config();

// Function to send email

// Create a nodemailer transporter using your mail credentials
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like 'sendgrid', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

const sendEmail = (email, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: htmlContent, // Send the compiled HTML
  };

  return transporter.sendMail(mailOptions);
};

const generateItinerary = (startDate, endDate, existingItinerary = []) => {
  const itinerary = [];
  const start = moment(startDate);
  const end = moment(endDate);

  const daysDiff = end.diff(start, "days") + 1; // Include the end date

  // Iterate through the number of days and preserve activities for existing days
  for (let i = 0; i < daysDiff; i++) {
    const day = start.clone().add(i, "days").format("ddd DD/MM"); // Format day

    // Find if this day already exists in the existing itinerary
    const existingDay = existingItinerary.find(
      (itineraryDay) => itineraryDay.day === day
    );

    // If day exists, keep its activities, otherwise initialize empty activities
    itinerary.push({
      day,
      activities: existingDay ? existingDay.activities : [], // Preserve activities if day exists
    });
  }

  return itinerary;
};

export const createTrip = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, tripMates } = req.body;

    // Extract the token from cookies
    const token = req.cookies.token; // Assuming the token is in a cookie named "token"

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const createdBy = decoded.email;

    if (tripMates.includes(createdBy)) {
      return res
        .status(400)
        .json({ message: "You cannot add yourself as a tripmate" });
    }

    const validTripMates = [];
    const dashboardLink = `${process.env.CLIENT_URL}/dashboard`;
    const registrationLink = `${process.env.CLIENT_URL}/register`;
    for (let email of tripMates) {
      const user = await User.findOne({ email }); // Check if email exists in master_user collection
      if (user) {
        validTripMates.push(email); // Only add valid users to tripmates

        // Read the Handlebars template for the trip invitation
        fs.readFile(
          "views/tripAddedTemplate.html",
          "utf-8",
          (err, htmlContent) => {
            if (err) {
              console.error("Error reading template:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            // Compile the template with dynamic data
            const template = handlebars.compile(htmlContent);
            const replacements = {
              name: user.name,
              destination,
              startDate,
              endDate,
              dashboardLink: dashboardLink,
            };
            const htmlToSend = template(replacements);

            const subject = `You've been added to a trip: ${destination}`;

            try {
              // Send email to user that they were added to the trip
              sendEmail(email, subject, htmlToSend);
              console.log(`Email sent to ${email}`);
            } catch (err) {
              console.error(`Failed to send email to ${email}:`, err);
            }
          }
        );
      } else {
        // Handle sending the invitation email for registration using a template
        fs.readFile(
          "views/inviteEmailTemplate.html",
          "utf-8",
          (err, htmlContent) => {
            if (err) {
              console.error("Error reading invitation template:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            // Compile the template for the invitation
            const template = handlebars.compile(htmlContent);
            const replacements = {
              name: email,
              registrationLink: registrationLink,
            };
            const htmlToSend = template(replacements);

            const subject = `Join TravelTally to plan your trip`;

            try {
              // Send the invitation email
              sendEmail(email, subject, htmlToSend);
              console.log(`Invitation email sent to ${email}`);
            } catch (err) {
              console.error(`Failed to send invitation to ${email}:`, err);
            }
          }
        );
      }
    }
    validTripMates.push(createdBy);

    const itinerary = generateItinerary(startDate, endDate);
    // Create a new trip with the createdBy and tripMates as emails
    const newTrip = new Trip({
      destination,
      startDate,
      endDate,
      budget,
      createdBy, // Set createdBy as the authenticated user
      tripMates: validTripMates, // Store only valid tripMates (those in master_user)
      itinerary,
    });

    // Save the trip
    await newTrip.save();

    // Add this trip's _id to each valid tripmate's 'trips' array in master_user collection
    for (let email of validTripMates) {
      await User.findOneAndUpdate(
        { email },
        { $push: { trips: newTrip._id } } // Add the trip _id to the 'trips' array of each valid tripmate
      );
    }

    // Return the newly created trip
    res.status(201).json(newTrip);
  } catch (error) {
    console.error("Error creating trip:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error creating trip", error: error.message });
  }
};

export const getTrips = async (req, res) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Assuming 'userId' is stored in the token payload

    // Find the user by userId in the master_user collection
    const user = await User.findById(userId).populate("trips"); // Populate the trips field with trip details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has trips
    if (!user.trips || user.trips.length === 0) {
      return res.status(200).json([]); // Return an empty array if no trips
    }

    // Send the trips details
    res.status(200).json(user.trips);
  } catch (error) {
    console.error("Error fetching trips:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching trips", error: error.message });
  }
};

// Controller to get trip overview details
export const getTripOverview = async (req, res) => {
  const { tripId } = req.params;

  try {
    // Find the trip by ID and select only the relevant fields
    const trip = await Trip.findById(tripId).select(
      "destination startDate endDate budget"
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Return the relevant trip overview details
    res.json({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
    });
  } catch (error) {
    console.error("Error fetching trip overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function to update trip overview
export const updateTripOverview = async (req, res) => {
  const { tripId } = req.params;
  const { destination, startDate, endDate, budget } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if dates have changed
    const startDateChanged =
      new Date(startDate).getTime() !== new Date(trip.startDate).getTime();
    const endDateChanged =
      new Date(endDate).getTime() !== new Date(trip.endDate).getTime();

    // Update the trip details
    trip.destination = destination;
    trip.startDate = new Date(startDate);
    trip.endDate = new Date(endDate);
    trip.budget = budget;

    // If start or end dates changed, update the itinerary
    if (startDateChanged || endDateChanged) {
      trip.itinerary = generateItinerary(startDate, endDate, trip.itinerary);
    }

    await trip.save();
    res.json(trip); // Return the updated trip
  } catch (error) {
    console.error("Error updating trip overview:", error);
    res.status(500).json({ message: "Failed to update trip overview" });
  }
};

// Controller function to get tripmates for a specific trip
export const getTripMates = async (req, res) => {
  const { tripId } = req.params;

  try {
    // Find the trip by its ID and return only the tripMates array
    const trip = await Trip.findById(tripId).select("tripMates");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Respond with the tripmates array
    res.status(200).json({ tripMates: trip.tripMates });
  } catch (error) {
    console.error("Error fetching tripmates:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller function to update tripmates for a specific trip
export const updateTripMates = async (req, res) => {
  const { tripId } = req.params;
  const { tripMates } = req.body; // New list of tripmates

  if (!Array.isArray(tripMates)) {
    return res.status(400).json({ message: "tripMates should be an array" });
  }

  try {
    // Find the existing trip
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Validate emails and remove duplicates within the new list
    const validTripMates = [];
    const seenEmails = new Set();

    for (const email of tripMates) {
      // Check if the email is already in the new list (duplicate)
      if (seenEmails.has(email)) {
        return res
          .status(400)
          .json({ message: `Duplicate email found in input: ${email}` });
      }

      // Check if the email is registered in the User collection
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: `Email is not registered: ${email}` });
      }

      // Add valid, unique, and registered emails to the list
      validTripMates.push(email);
      seenEmails.add(email);
    }

    // Update the tripMates array with the new validated list
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { tripMates: [...validTripMates] } }, // Replace tripMates with the new list
      { new: true } // Return the updated trip
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found after update" });
    }

    // Ensure the trip ID is added to each user's 'trips' array without duplicates
    for (let email of validTripMates) {
      await User.findOneAndUpdate(
        { email },
        { $addToSet: { trips: trip._id } }, // $addToSet will only add the trip if it’s not already in the array
        { new: true }
      );
    }

    // Respond with the updated tripmates array
    res.status(200).json({ tripMates: updatedTrip.tripMates });
  } catch (error) {
    console.error("Error updating tripmates:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch itinerary for a specific trip
export const getItinerary = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).select("itinerary");
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip.itinerary); // Return the itinerary
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({ message: "Error fetching itinerary" });
  }
};

// Controller function to add an activity to the itinerary
export const addActivityToItinerary = async (req, res) => {
  const { tripId } = req.params; // Get the trip ID from the request parameters
  const { dayIndex, activity } = req.body; // Get the day index and activity details from the request body

  try {
    // Find the trip by ID
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if the itinerary and day index are valid
    if (!trip.itinerary || !trip.itinerary[dayIndex]) {
      return res.status(400).json({ message: "Invalid day index" });
    }

    // Add the new activity to the correct day
    trip.itinerary[dayIndex].activities.push(activity);

    // Save the updated trip document to the database
    await trip.save();

    // Send back the updated itinerary
    res.status(200).json(trip.itinerary);
  } catch (error) {
    console.error("Error adding activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteActivity = async (req, res) => {
  const { tripId } = req.params; // Trip ID from URL parameters
  const { dayIndex, activityIndex } = req.body; // Day and activity index from request body

  try {
    // Find the trip by its ID
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if the day exists
    if (!trip.itinerary[dayIndex]) {
      return res.status(400).json({ message: "Invalid day index" });
    }

    // Check if the activity exists
    if (!trip.itinerary[dayIndex].activities[activityIndex]) {
      return res.status(400).json({ message: "Invalid activity index" });
    }

    // Remove the specific activity from the itinerary
    trip.itinerary[dayIndex].activities.splice(activityIndex, 1);

    // Save the updated trip document
    await trip.save();

    // Respond with the updated itinerary
    res.status(200).json(trip.itinerary);
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//delete trip

export const exitTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId; // Get the logged-in user's ID
    const user = await User.findById(userId); // Find the user

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the user's email from the tripMates array in the Trip model
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { $pull: { tripMates: user.email } }, // Use email if that's what is stored in tripMates
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Remove the trip ID from the user's trips list in the User model
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { trips: tripId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "You have exited the trip successfully." });
  } catch (error) {
    console.error("Error exiting trip:", error);
    res.status(500).json({ message: "Server error" });
  }
};
