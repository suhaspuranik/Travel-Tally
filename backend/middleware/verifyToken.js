import jwt from "jsonwebtoken"; // Default import
const { verify } = jwt; // Destructure the 'verify' function

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Assuming the token is stored in the "token" cookie
  // console.log("Token from cookies:", req.cookies.token);
  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Add the decoded information (userId) to the request object for use in other routes
    // console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  });
};

export default verifyToken;
