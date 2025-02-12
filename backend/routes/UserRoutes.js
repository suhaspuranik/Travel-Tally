// routes/userRoutes.js
import dotenv from "dotenv";
import { Router } from "express";
import passport from "passport";
import verifyToken from "../middleware/verifyToken.js"; // Import passport as a default import
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
const router = Router();
import jwt from "jsonwebtoken";

import { getUsersByEmails } from '../controllers/userController.js'; // Import the new controller function

// Route to get users by emails
router.post('/get-users', getUsersByEmails); // Add this line for fetching users by emails

dotenv.config();

// Registration and login routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Google OAuth routes
// router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get("/auth/google", (req, res, next) => {
  const action = req.query.action; // 'login' or 'register'
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: action, // Pass the action parameter as the state
  })(req, res, next);
});

router.get("/auth/google/callback", (req, res, next) => {
  const action = req.query.state;

  passport.authenticate("google", (err, user, info) => {
    if (err) {
      // If there is a specific error from Google, redirect with a generic error message
      const message =
        "An error occurred during Google authentication. Please try again.";
      return res.redirect(
        `${process.env.CLIENT_URL}/${action}?message=${encodeURIComponent(
          message
        )}`
      );
    }

    if (!user) {
      // Handle failure case, pass failure message if any
      const message =
        info && info.message ? info.message : "Authentication failed";
      return res.redirect(
        `${process.env.CLIENT_URL}/${action}?message=${encodeURIComponent(
          message
        )}`
      );
    }

    // If user is authenticated, proceed with login and redirect
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        const message =
          "An error occurred while logging you in. Please try again.";
        return res.redirect(
          `${process.env.CLIENT_URL}/${action}?message=${encodeURIComponent(
            message
          )}`
        );
      }
      // Create a JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email }, // Payload: data to encode
        process.env.JWT_SECRET, // Secret key to sign the token
        { expiresIn: "1d" } // Set an expiration time (optional)
      );
      // Store the JWT token in a cookie
      res.cookie("token", token, {
        httpOnly: true, // Ensures the cookie is only accessible by the server
        secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
        maxAge: 86400000, // 1 day expiration
      });

      // Create a JWT token for loggedIn flag
      const flag = jwt.sign(
        { loggedIn: true }, // Payload: data to encode
        process.env.JWT_SECRET, // Secret key to sign the token
        { expiresIn: "1d" } // Set an expiration time (optional)
      );
      // Store the JWT token in a cookie
      res.cookie("loggedIn", flag, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
        maxAge: 86400000, // 1 day expiration
      });

      return res.redirect(`${process.env.CLIENT_URL}/dashboard`); // Successful login
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error during logout");

    // Clear cookies safely
    res.clearCookie("token");
    res.clearCookie("loggedIn");

    res.status(200).json({ message: "logout successful" });
  });
});

//fetching profile

export default router;
