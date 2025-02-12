// controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import handlebars from "handlebars";
import axios from "axios";

const { hash, compare } = bcrypt;
import jwt from "jsonwebtoken";

dotenv.config();

// Register a new user

// export async function registerUser(req, res) {
//   const { name, email, password, confirmPassword } = req.body;

//   if (password !== confirmPassword) {
//     return res.status(400).json({ message: "Passwords do not match" });
//   }

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already in use" });
//     }

//     const hashedPassword = await hash(password, 10);
//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     res.status(201).json({ message: "Registration successful!" });
//   } catch (error) {
//     // console.error("Error during registration:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

export async function registerUser(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  // Email validation: must contain @ and .
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Password confirmation check
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password and save new user
    const hashedPassword = await hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Login user
export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Check if the user was registered via Google and doesn't have a password
    if (!user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await compare(password, user.password);

    if (isPasswordValid) {
      // Create a JWT token for user details
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        }, // Payload: data to encode
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

      res.status(200).json({ message: "Login successful",token:token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login operation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Google OAuth callback
export async function googleOAuthCallback(
  accessToken,
  refreshToken,
  profile,
  done
) {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // User already exists, pass an error message to `done`
      return done(null, user); // Keep this for successful login
    } else {
      const emailExists = await User.findOne({
        email: profile.emails[0].value,
      });

      if (emailExists) {
        // Email is already registered with a different provider
        return done(null, false, { message: "Invalid credentials" });
      }

      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        profilePic_url: profile.photos[0].value,
        auth_provider: "Google",
      });

      user = await newUser.save();
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}

// Serialize and deserialize user
export function serializeUser(user, done) {
  done(null, user.googleId);
}

export async function deserializeUser(id, done) {
  try {
    const user = await User.findOne({ googleId: id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration time

    await User.updateOne(
      { email },
      {
        $set: { resetToken, resetTokenExpiration },
      }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Read the Handlebars template
    fs.readFile(
      "views/forgotPasswordTemplate.html",
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
          resetLink: resetLink,
        };
        const htmlToSend = template(replacements);

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Password Reset Request",
          html: htmlToSend,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ message: "Error sending email" });
          }
          res.status(200).json({
            message: "Password reset link has been sent to your email",
          });
        });
      }
    );
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if (user.resetTokenExpiration < Date.now()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { resetToken: token },
      {
        $set: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiration: null,
        },
      }
    );

    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export const getUsersByEmails = async (req, res) => {
  const { emails } = req.body;

  try {
    const users = await User.find({ email: { $in: emails } });
    const userNames = users.map(user => ({
      email: user.email,
      name: user.name
    }));

    res.status(200).json(userNames);  // Send back the user's name and email
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};
//fetching profile
export async function getUserProfile(req, res) {
  try {
    const { userId, email, name, profilePic_url } = req.user; // Extract user data from the middleware

    // Optionally, fetch the latest user data from the database if required:
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send profile details, overriding any outdated token data if fetched from the DB
    res.status(200).json({
      userId: user._id,
      email: user.email,
      name: user.name,
    });
    console.log(user.profilePic_url);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
//change profile pic
