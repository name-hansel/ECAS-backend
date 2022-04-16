const express = require("express");
const router = express.Router();
const { isValidObjectId } = require("mongoose");

const Query = require("../../models/Query");
const { idValidator } = require("../../utils/validationMiddleware");

// @route   GET /api/student/query/user
// @desc    Get queries asked by user
// @access  Private
router.get("/user", async (req, res) => {
  try {
    const userId = req._id;
    if (!userId) return res.status(400).json({
      error: 'User not found'
    });

    if (!isValidObjectId(userId)) return res.status(400).json({
      error: 'Invalid user'
    });

    const queryData = await Query.find({
      askedBy: userId
    }).sort({ createdAt: -1 }).populate('askedBy answeredBy').populate({
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

// @route   GET /api/student/query
// @desc    Get all queries
// @access  Private
router.get("/", async (req, res) => {
  try {
    const queryData = await Query.find().sort({ createdAt: -1 }).populate('askedBy answeredBy').populate({
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
});

// @route   POST /api/student/query
// @desc    Add a new query
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.length === 0) return res.status(400).json({
      error: 'Question is required'
    });

    const newQuery = new Query({
      question,
      askedBy: req._id
    })

    const savedQuery = await newQuery.save();
    await savedQuery.populate('askedBy');

    res.status(200).json(savedQuery);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
});

// @route   DELETE /api/student/query
// @desc    Delete an unanswered query
// @access  Private
router.delete("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const queryData = await Query.findById(_id).populate('askedBy');
    if (!queryData) return res.status(404).json({
      error: 'Query not found'
    })
    if (queryData.askedBy._id != req._id) return res.status(403).json({
      error: 'Forbidden.'
    })

    if (queryData.answer) return res.status(400).json({
      error: 'Answered queries cannot be deleted.'
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

module.exports = router