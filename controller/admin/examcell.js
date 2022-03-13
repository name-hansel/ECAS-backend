const express = require("express");
const router = express.Router();

const ExamCell = require("../../models/ExamCell")
const { examCellValidator, idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/admin/exam_cell/:_id
// @desc    Get examcell member by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params
    const examCellMemberData = await ExamCell.findById(_id);
    if (!examCellMemberData) return res.status(404).json({ error: "Exam Cell member not found" })

    res.status(200).json(examCellMemberData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/admin/exam_cell
// @desc    Get all examcell members
// @access  Private
router.get("/", async (req, res) => {
  try {
    const examCellMemberData = await ExamCell.find();
    res.status(200).json(examCellMemberData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/admin/exam_cell
// @desc    Add examcell member
// @access  Private
router.post("/", examCellValidator, async (req, res) => {
  try {
    const newExamCellMember = new ExamCell({
      employeeId: req.body.employeeId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    })

    const examCellMember = await newExamCellMember.save();
    res.status(201).json(examCellMember);
  } catch (err) {
    if (!err.code) {
      console.error(err.message);
      return res.status(500).json({
        error: "Server error",
      });
    }
    if (err.code === 11000) {
      res.status(400).json({
        error: [{
          param: Object.keys(err.keyPattern)[0],
          msg: `A user with this data already exists`
        }]
      })
    }
  }
})

// @route   PUT api/admin/exam_cell/:_id
// @desc    Edit examcell member
// @access  Private
router.put("/:_id", [idValidator, examCellValidator], async (req, res) => {
  try {
    const { _id } = req.params;

    // Find the examcell member by id and update
    const updatedExamCellMemberData = await ExamCell.findByIdAndUpdate(_id, {
      employeeId: req.body.employeeId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    }, { new: true })
    if (!updatedExamCellMemberData) return res.status(404).json({ error: "Exam Cell member not found" })

    res.status(200).json(updatedExamCellMemberData)
  } catch (err) {
    if (!err.code) {
      console.error(err.message);
      return res.status(500).json({
        error: "Server error",
      });
    }
    if (err.code === 11000) {
      res.status(400).json({
        error: [{
          param: Object.keys(err.keyPattern)[0],
          msg: `A user with this data already exists`
        }]
      })
    }
  }
})

// @route   DELETE api/admin/exam_cell/:_id
// @desc    Delete examcell member
// @access  Private
router.delete("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;

    const examCellMemberData = await ExamCell.findByIdAndDelete(_id);
    if (!examCellMemberData) return res.status(404).json({ error: "Exam Cell member not found" })

    res.status(204).end()
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;