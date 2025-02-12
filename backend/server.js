import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import userRoutes from "./routes/UserRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import passportConfig from "./config/passport.js";
import connectDB from "./db.js";
import cookieParser from "cookie-parser";
import expenseRoutes from "./routes/ExpenseRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
connectDB();

// Initialize app
const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" })); // Increase limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Add this line to parse cookies
// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(bodyParser.json());

// Content Security Policy middleware
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'self' https://apis.google.com; ..."
  );
  next();
});

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
  })
);

// Passport initialization
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// Fix for ES modules: Define __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Serve static files from "views" directory
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Serve the HTML file when the root URL is accessed
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "views", "forgotPasswordTemplate.html"));
// });

// Routes
app.use("/api", userRoutes);
app.use("/trips", tripRoutes);
app.use("/expenses", expenseRoutes);
app.use("/profile", profileRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
