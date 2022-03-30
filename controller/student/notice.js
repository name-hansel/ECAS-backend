const express = require("express");
const router = express.Router();

const Notice = require("../../models/Notice");
const { idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/student/notice/:_id
// @desc    Get notice by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const noticeData = await Notice.findById(_id).sort({ createdAt: -1 }).select('title description branch year attachments addedBy').populate('branch').populate('addedBy', '_id firstName lastName');
    if (!noticeData || !noticeData.visible) return res.status(404).json({
      error: 'Notice not found'
    })

    res.status(200).json(noticeData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/student/notice
// @desc    Get notices relevant to student
// @access  Private
router.get("/", async (req, res) => {
  try {
    const noticeData = await Notice.find({
      visible: true,
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