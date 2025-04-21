const User = require("../models/user.model");
const { validationResult } = require("express-validator");
const UserService = require("../services/user.service");
const blogModel = require('../models/blog.model');
const Message = require('../models/message.model');

module.exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, phone, password, role, specialization, hospital, medicalRegNumber, degrees, street, area, city, state, pincode, gender } = req.body;

    // Get Cloudinary URLs
    const idProof = req.files?.idProof ? req.files.idProof[0].path : null;
    const profilePhoto = req.files?.profilePhoto ? req.files.profilePhoto[0].path : null;

    if (role === "doctor" && (!specialization || !hospital || !medicalRegNumber)) {
      return res.status(400).json({ message: "All doctor fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ 
      fullName, 
      email, 
      phone,
      password, 
      role, 
      specialization, 
      hospital, 
      medicalRegNumber, 
      degrees, 
      idProof, 
      street,
      area,
      city,
      state,
      pincode,
      gender, 
      profilePhoto 
    });

    try {
      await newUser.save();
    } catch (saveError) {
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({ 
          message: "Validation Error", 
          errors: Object.values(saveError.errors).map(err => err.message) 
        });
      }
      throw saveError;
    }

    const token = newUser.generateAuthToken();
    res.status(201).json({ 
      user: { 
        id: newUser._id, 
        fullName: newUser.fullName, 
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        street: newUser.street,
        area: newUser.area,
        city: newUser.city,
        state: newUser.state,
        pincode: newUser.pincode,
        gender: newUser.gender,
        profilePhoto: newUser.profilePhoto
      }, 
      token 
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id).select('-password -idProof'); // Exclude sensitive fields
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const mongoose = require('mongoose'); // Add this import at the top

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update login tracking
    user.lastLogin = new Date();
    user.loginCount += 1;
    user.isOnline = true;
    await user.save();

    const token = user.generateAuthToken();
    res.status(200).json({ 
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        gender: user.gender,
        profilePhoto: user.profilePhoto,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        isOnline: user.isOnline
      }, 
      token 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getProfile = async (req, res) => {
  const userId = req.params.id; // Get user ID from route parameters

  try {
    const user = await User.findById(userId).select('-password -idProof'); // Fetch user by ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from route parameters
    const updatedData = req.body;

    // If a file is uploaded, add the file URL
    if (req.file) {
      updatedData.profilePhoto = req.file.path; // This assumes local storage; replace with Cloudinary URL if needed
    }

    // Update user profile using the service
    const updatedUser = await UserService.updateUserProfile(userId, updatedData);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.createBlog = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const image = req.files?.blogImage ? req.files.blogImage[0].path : null; // Assuming you're using multer for file uploads

    const newBlog = new blogModel({
      title,
      content,
      authorId,
      blogImage: image
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find().populate('authorId', 'fullName email');
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    
    let query = { role: 'doctor' };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .select('-password -idProof')
      .sort({ fullName: 1 });

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ 
        message: 'No doctors found',
        suggestions: 'Try adjusting your search criteria'
      });
    }

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ 
      message: 'Failed to fetch doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports.getLoginStats = async (req, res) => {
  try {
    // Get total users and doctors
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });

    // Get online users and doctors
    const onlineUsers = await User.countDocuments({ role: 'user', isOnline: true });
    const onlineDoctors = await User.countDocuments({ role: 'doctor', isOnline: true });

    // Get total logins
    const totalLogins = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$loginCount" } } }
    ]);

    // Get doctor logins
    const doctorLogins = await User.aggregate([
      { $match: { role: 'doctor' } },
      { $group: { _id: null, total: { $sum: "$loginCount" } } }
    ]);

    res.status(200).json({
      totalUsers,
      totalDoctors,
      onlineUsers,
      onlineDoctors,
      totalLogins: totalLogins[0]?.total || 0,
      doctorLogins: doctorLogins[0]?.total || 0
    });
  } catch (error) {
    console.error("Get Login Stats Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Fixed limit of 10 users per page
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password -idProof')
        .sort({ lastLogin: -1 }) // Sort by lastLogin in descending order
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);
    
    res.status(200).json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the user
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = new User({
      fullName: name,
      email,
      role,
      password,
      status: 'active',
      lastLogin: new Date(),
      loginCount: 0,
      isOnline: false
    });

    await newUser.save();

    // Return user data without sensitive information
    const userData = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      lastLogin: newUser.lastLogin,
      isOnline: newUser.isOnline
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

