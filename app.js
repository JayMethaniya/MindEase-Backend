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

module.exports = app; // Export the Express app
