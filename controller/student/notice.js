const express = require("express");
const router = express.Router();

const Notice = require("../../models/Notice")

// @route   GET /api/student/notice
// @desc    Get notices relevant to student
// @access  Private
router.get("/", async (req, res) => {
  try {
    const noticeData = await Notice.find({
      branch: req.branch,
      year: req.year
    }).sort({ createdAt: -1 }).select('title description branch year attachments addedBy').populate('branch').populate('addedBy', '_id firstName lastName');
    res.status(200).json(noticeData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router