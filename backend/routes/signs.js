const express = require("express");
const multer = require("multer");
const Sign = require("../models/Sign");
const router = express.Router();

// Set up image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Add a new sign
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { translation } = req.body;
    const iscommon = req.body.iscommon;
    const image = req.file ? req.file.filename : null;
    if (!translation || !image) return res.status(400).json({ msg: "All fields required" });

    const newSign = new Sign({ translation, image , iscommon});
    await newSign.save();
    res.status(201).json(newSign);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all signs
router.get("/", async (req, res) => {
  try {
    const signs = await Sign.find();
    res.json(signs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
router.get("/iscommon", async (req, res) => {
    try {
      const signs = await Sign.find({ iscommon: true });
      res.json(signs);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

module.exports = router;
