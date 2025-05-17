const express = require("express");
const Video = require("../models/Video");
const router = express.Router();

// Create a new video
router.post("/", async (req, res) => {
  try {
    const { title, place, videoUrl } = req.body;

    if (!title || !place || !videoUrl) {
      return res.status(400).json({
        error: true,
        message: "All fields (title, place, videoUrl) are required"
      });
    }

    const newVideo = new Video({
      title,
      place,
      videoUrl
    });

    const savedVideo = await newVideo.save();
    res.status(201).json({
      success: true,
      data: savedVideo
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || "Server error occurred"
    });
  }
});

// Get all videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || "Server error occurred"
    });
  }
});

// Get video by ID
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        error: true,
        message: "Video not found"
      });
    }
    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || "Server error occurred"
    });
  }
});

// Update video
router.put("/:id", async (req, res) => {
  try {
    const { title, place, videoUrl } = req.body;
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { title, place, videoUrl },
      { new: true, runValidators: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({
        error: true,
        message: "Video not found"
      });
    }

    res.json({
      success: true,
      data: updatedVideo
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || "Server error occurred"
    });
  }
});

// Delete video
router.delete("/:id", async (req, res) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);
    
    if (!deletedVideo) {
      return res.status(404).json({
        error: true,
        message: "Video not found"
      });
    }

    res.json({
      success: true,
      message: "Video deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || "Server error occurred"
    });
  }
});

module.exports = router; 