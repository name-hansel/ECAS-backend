const express = require("express");
const router = express.Router();

const Course = require("../../models/Course");

// @route   GET /api/exam_cell/course
// @desc    Get all active courses
// @access  Private
router.get("/", async (req, res) => {
  try {
    const courseData = await Course.find({
      archived: false
    }).populate('branch', 'code name');
    res.status(200).json(courseData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;