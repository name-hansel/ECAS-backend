const express = require("express");
const router = express.Router();

const Query = require("../../models/Query");
const { idValidator } = require("../../utils/validationMiddleware");

// @route   GET /api/exam_cell/query/:_id
// @desc    Get query by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const queryData = await Query.findById(_id).populate('askedBy', 'firstName lastName branch currentSemester').populate('answeredBy', 'firstName lastName').populate({
      path: 'askedBy',
      populate: [{
        path: 'branch',
        model: 'Branch',
        select: '-_id name'
      }]
    });

    if (!queryData) return res.status(404).json({
      error: 'Query not found'
    })

    res.status(200).json(queryData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
});

// @route   GET /api/exam_cell/query
// @desc    Get all queries
// @access  Private
router.get("/", async (req, res) => {
  try {
    const queryData = await Query.find().sort({ createdAt: -1 }).populate('askedBy', 'firstName lastName branch currentSemester').populate('answeredBy', 'firstName lastName').populate({
      path: 'askedBy',
      populate: [{
        path: 'branch',
        model: 'Branch',
        select: '-_id name'
      }]
    });

    res.status(200).json(queryData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/query/:_id
// @desc    Add answer to a query
// @access  Private
router.post("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const { answer } = req.body;

    if (!answer || answer.length === 0) return res.status(404).json({
      error: 'Answer is required'
    })

    const queryData = await Query.findById(_id).populate('askedBy', 'firstName lastName branch currentSemester').populate('answeredBy', 'firstName lastName').populate({
      path: 'askedBy',
      populate: [{
        path: 'branch',
        model: 'Branch',
        select: '-_id name'
      }]
    });

    if (!queryData) return res.status(404).json({
      error: 'Query not found'
    })

    queryData.answer = answer;
    queryData.answeredBy = req.user_id;

    await queryData.save();
    res.status(200).json(queryData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PATCH /api/exam_cell/query/:_id
// @desc    Edit answer to a query
// @access  Private
router.patch("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const { answer } = req.body;

    if (!answer || answer.length === 0) return res.status(404).json({
      error: 'Answer is required'
    });

    const queryData = await Query.findById(_id).populate('askedBy', 'firstName lastName branch currentSemester').populate('answeredBy', 'firstName lastName').populate({
      path: 'askedBy',
      populate: [{
        path: 'branch',
        model: 'Branch',
        select: '-_id name'
      }]
    });

    if (!queryData) return res.status(404).json({
      error: 'Query not found'
    })

    queryData.answer = answer;
    queryData.answeredBy = req.user_id;

    await queryData.save();
    res.status(200).json(queryData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/exam_cell/query/:_id
// @desc    Delete a query
// @access  Private
router.delete("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const queryData = await Query.findById(_id);
    if (!queryData) return res.status(404).json({
      error: 'Query not found'
    })

    await Query.findByIdAndDelete(_id);
    res.status(204).end();
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;