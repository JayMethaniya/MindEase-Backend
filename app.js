require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/db");
const Admin = require("./models/adminModel");
const bcrypt = require("bcrypt");

// Initialize Express App
const app = express();
connectDB();

// Middleware
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Activity tracking middleware
app.use(async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      const userController = require("./controllers/user.controller");
      await userController.updateLastActivity(req.user._id);
    }
  } catch (error) {
    console.error("Activity tracking error:", error);
  }
  next();
});

// Routes
const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);
const moodRoutes = require("./routes/mood.routes");
app.use("/mood", moodRoutes);
const blogRoutes = require("./routes/blog.routes");
app.use("/blog", blogRoutes);
const resourceRoutes = require("./routes/resource.routes");
app.use("/resource", resourceRoutes);
const chatRoutes = require("./routes/chat.routes");
app.use("/chat", chatRoutes);
const messageRoutes = require("./routes/message.routes");
app.use("/message", messageRoutes);
const contactRoutes = require("./routes/contact.routes");
app.use("/contact", contactRoutes);
const journalRoutes = require("./routes/journal.routes");
app.use("/journal", journalRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);
module.exports = app; // Export the Express app
