import { Router } from "express";
import {
  addFriend,
  getFriends,
  removeFriend,
  getProfile,
  updateProfilePic,
  updatePassword,
  updateProfile,
} from "../controllers/profileController.js";
import verifyToken from "../middleware/verifyToken.js";
import multer from "multer";

const router = Router();

// File upload configuration with Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/; // Support modern formats
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(file.originalname.toLowerCase());
    if (mimeType && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
    }
  },
});

// Friend management routes
router.post("/add-friends", verifyToken, addFriend);
router.get("/get-friends", verifyToken, getFriends);
router.delete("/remove-friend", verifyToken, removeFriend);

// Profile-related routes
router.get("/get-profile", verifyToken, getProfile);
router.put("/update", verifyToken, updateProfile);
router.put(
  "/picture",
  verifyToken,
  upload.single("profilePic"),
  async (req, res, next) => {
    try {
      await updateProfilePic(req, res);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);
router.put("/password", verifyToken, async (req, res) => {
  try {
    await updatePassword(req, res);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating password", error: err.message });
  }
});

export default router;
