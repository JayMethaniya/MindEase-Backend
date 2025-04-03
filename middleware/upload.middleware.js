const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'user_uploads', // Folder in Cloudinary
    format: file.mimetype.split('/')[1], // Ensures correct file format
    public_id: `${Date.now()}-${file.originalname}`
  })
});

// Multer middleware
const upload = multer({ storage });

module.exports = upload;
