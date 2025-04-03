const User = require("../model/user.model");
const { validationResult } = require("express-validator");

module.exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, role, specialization, hospital, medicalRegNumber, degrees ,address,gender } = req.body;
    const idProof = req.file ? req.file.path : null;

    if (role === "doctor" && (!specialization || !hospital || !medicalRegNumber)) {
      return res.status(400).json({ message: "All doctor fields are required" }); 
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ fullName, email, password, role, specialization, hospital, medicalRegNumber, degrees, idProof ,address,gender });
    await newUser.save();

    const token = newUser.generateAuthToken();
    res.status(201).json({ user: newUser, token });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
    res.status(200).json({ user, token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
