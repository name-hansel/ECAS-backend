const express = require("express");
const router = express.Router();

const Quiz = require("../../models/Quiz");

// @route   GET /api/student/quiz
// @desc    Get all relevant quizzes
// @access  Private
router.get("/", async (req, res) => {
  try {
    const quizData = await Quiz.find({
      semester: req.semester,
      division: req.division,
      resultPublish: true
    }).select('title course faculty resultFile').populate('course', 'name code semester').populate('faculty', 'firstName lastName');

    return res.status(200).json(quizData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;