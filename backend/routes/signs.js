const express = require("express");
const multer = require("multer");
const Sign = require("../models/Sign");
const router = express.Router();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sign-language",
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Added WebP format
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req, file) => {
      const filename = file.originalname.replace(/\.[^/.]+$/, "");
      return `sign_${filename}_${Date.now()}`;
    }
  }
});

// Configure multer with error handling
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single("image");

// Add a new sign with custom error handling for multer
router.post("/", (req, res) => {
  upload(req, res, async function(err) {
    // Handle multer and Cloudinary errors
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ 
        error: true, 
        message: err.message || "File upload failed" 
      });
    }
    
    try {
      console.log("Request Body:", req.body);
      console.log("Uploaded File:", req.file);
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ 
          error: true,
          message: "No image file was uploaded" 
        });
      }
      
      const { translation, iscommon } = req.body;
      
      // Get the secure URL from Cloudinary
      const image = req.file.path;
      
      if (!translation) {
        return res.status(400).json({ 
          error: true,
          message: "Translation field is required" 
        });
      }
      
      // Create new sign with proper boolean conversion
      const newSign = new Sign({
        translation,
        image,
        iscommon: iscommon === "true" || iscommon === true
      });
      
      const savedSign = await newSign.save();
      
      // Return success response
      return res.status(201).json({
        success: true,
        data: savedSign
      });
    } catch (error) {
      console.error("Server Error:", error);
      return res.status(500).json({ 
        error: true,
        message: error.message || "Server error occurred"
      });
    }
  });
});

// Get all signs
router.get("/", async (req, res) => {
  try {
    const signs = await Sign.find();
    res.json(signs);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

// Get common signs
router.get("/iscommon", async (req, res) => {
  try {
    const signs = await Sign.find({ iscommon: true });
    res.json(signs);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

module.exports = router;