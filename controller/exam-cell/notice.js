const express = require("express");
const router = express.Router();

const Notice = require("../../models/Notice")
const { idValidator, noticeValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/exam_cell/notice/:_id
// @desc    Get notice by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const noticeData = await Notice.findOne({ _id })

    if (!noticeData) return res.status(404).json({
      error: 'Notice not found'
    })

    res.status(200).json(noticeData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/notice
// @desc    Get all notices
// @access  Private
router.get("/", async (req, res) => {
  try {
    const noticeData = await Notice.find();
    res.status(200).json(noticeData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/notice
// @desc    Add new notice
// @access  Private
router.post("/", noticeValidator, async (req, res) => {
  try {
    // TODO upload attachments and add to array
    const { title, description, branch, semester } = req.body;
    const newNotice = new Notice({
      title, description, branch, semester
    })
    const branchData = await newNotice.save();
    res.status(201).json(branchData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PUT /api/exam_cell/notice/:_id
// @desc    Edit notice
// @access  Private
router.put('/:_id', idValidator, noticeValidator, async (req, res) => {
  try {
    // TODO delete attachments not present and upload new ones
    const { _id } = req.params;
    const { title, description, branch, semester } = req.body;
    const updatedNotice = await Notice.findByIdAndUpdate(_id, {
      title, description, branch, semester
    }, { new: true })

    if (!updatedNotice) return res.status(404).json({
      error: "Notice not found"
    })
    res.status(200).json(updatedNotice)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/exam_cell/notice/:_id
// @desc    Delete notice
// @access  Private
router.delete('/:_id', idValidator, async (req, res) => {
  try {
    // TODO delete attachments
    const { _id } = req.params;

    const noticeData = await Notice.findByIdAndDelete(_id);
    if (!noticeData) return res.status(404).json({ error: "Notice not found" })

    res.status(204).end()
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router