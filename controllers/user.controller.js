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
        profilePhoto: user.profilePhoto
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

