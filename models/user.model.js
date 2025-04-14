const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    minlength: [3, "Full name should be at least 3 characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please provide a valid email"],
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "doctor"],
    required: true,
  },
  specialization: { type: String },
  hospital: { type: String },
  medicalRegNumber: { type: String },
  degrees: { type: [String] },
  idProof: { type: String },
  address : { type:String},
  gender : { type:String},
  profilePhoto : {type:String}
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
