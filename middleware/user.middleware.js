const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Admin = require("../models/adminModel");

module.exports.authUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports.authAdminOrUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find admin first
    const admin = await Admin.findById(decoded.id);
    if (admin) {
      req.admin = admin;
      return next();
    }

    // If not admin, try to find user
    const user = await User.findById(decoded._id);
    if (user) {
      req.user = user;
      req.userId = user._id;
      return next();
    }

    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
