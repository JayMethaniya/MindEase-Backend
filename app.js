require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/db");

// Initialize Express App
const app = express();
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);
const moodRoutes = require("./routes/mood.routes");
app.use("/mood", moodRoutes);
const blogRoutes = require("./routes/blog.routes");
app.use("/blog", blogRoutes);
const supportGroupRoutes = require("./routes/supportGroup.routes");
app.use("/support-groups", supportGroupRoutes);

module.exports = app; // Export the Express app
