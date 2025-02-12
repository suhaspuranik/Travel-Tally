import jwt from "jsonwebtoken";
import User from "../models/User.js";
import multer from "multer";
import bcrypt from "bcryptjs";

// Assuming User model is correctly imported

export const addFriend = async (req, res) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.token; // Assuming the token is stored in a cookie

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the token to extract the user's email
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loggedInUserEmail = decoded.email;

    // Extract the tripmate email from the request body
    const { email: tripmateEmail } = req.body;

    // Check if the logged-in user is trying to add themselves as a friend
    if (tripmateEmail === loggedInUserEmail) {
      return res
        .status(400)
        .json({ message: "You cannot add yourself as a friend" });
    }

    // Find the logged-in user's document
    const loggedInUser = await User.findOne({ email: loggedInUserEmail });

    if (!loggedInUser) {
      return res.status(404).json({ message: "Logged-in user not found" });
    }

    // Check if the tripmate email is already in the user's friends list
    if (loggedInUser.friends.includes(tripmateEmail)) {
      return res
        .status(400)
        .json({ message: "This user is already your friend" });
    }

    // Find the tripmate's document to make sure the user exists
    const tripmateUser = await User.findOne({ email: tripmateEmail });

    if (!tripmateUser) {
      return res.status(404).json({ message: "Tripmate not found" });
    }

    // Add the tripmate's email to the logged-in user's friends array
    loggedInUser.friends.push(tripmateEmail);

    // Save the updated user document
    await loggedInUser.save();

    // Respond with a success message
    res.status(200).json({
      message: "Friend added successfully",
      friends: loggedInUser.friends,
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({
      message: "An error occurred while adding friend",
      error: error.message,
    });
  }
};

export const getFriends = async (req, res) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the token to extract the user's email
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;

    // Find the logged-in user in the database
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the user's friends list
    res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({
      message: "An error occurred while fetching friends list",
      error: error.message,
    });
  }
};

export const removeFriend = async (req, res) => {
  const { email } = req.body; // Email of the friend to be removed
  const token = req.cookies.token; // Assuming the token is stored in a cookie

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Verify the token to extract the user's email
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userEmail = decoded.email;
  try {
    // Update the user's document by removing the friend's email from their friends list
    const user = await User.findOneAndUpdate(
      { email: userEmail }, // Find the user by the authenticated user's email
      { $pull: { friends: email } }, // Remove the friend's email from the friends array
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Friend removed successfully", friends: user.friends });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove friend", error: err });
  }
};

//FETCH PROFILE

// controllers/profileController.js
// Import the User model

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId); // Use `req.user.userId`
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      userId: user._id,
      email: user.email,
      name: user.name,
      profilePic_url: user.profilePic_url,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
// Update profile picture
const upload = multer({
  dest: "uploads/profile-pics", // Store images in an 'uploads' folder
});

// Update profile picture
export const updateProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.file) {
      // If there's a new profile picture, store it in the database
      user.profilePic_url = req.file.path; // Save the file path in the DB
    }

    await user.save();
    res.json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Update password
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Use `req.user.userId`
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, profilePic_url, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePic_url) user.profilePic_url = profilePic_url;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
