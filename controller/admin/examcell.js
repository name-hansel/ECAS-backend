const express = require("express");
const router = express.Router();
const { isValidObjectId } = require("mongoose")
const { body, validationResult, param } = require("express-validator")

const ExamCell = require("../../models/ExamCell")

// @route   GET /api/admin/exam_cell/:_id
// @desc    Get examcell member by id
// @access  Private
router.get("/:_id", param("_id").custom(value => {
  // Custom validator to check if id is a valid object id
  if (!isValidObjectId(value)) {
    throw new Error("ID is not valid")
  }
  return true
}), async (req, res) => {
  try {
    // Check if express-validator threw errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

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
router.post("/", [
  // Check req.body content
  body('employeeId', 'Employee Id is required').notEmpty(),
  body('employeeId', 'Employee Id is not valid').isString(),
  body('salutation', 'Salutation is required').notEmpty(),
  body('salutation', 'Salutation is not valid').isIn(["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."]).isString(),
  body('firstName', "First name is required").notEmpty(),
  body('firstName', "First name is not valid").isString(),
  body('lastName', "Last name is required").notEmpty(),
  body('firstName', "Last name is not valid").isString(),
  body('email', "Email is required").notEmpty(),
  body('email', "Email is not valid").isEmail().isString(),
  body('phoneNumber', "Phone number is required").notEmpty(),
  body('phoneNumber', "Phone number is not valid").isMobilePhone("en-IN").isString()
], async (req, res) => {
  try {
    // Check if express-validator threw errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const newExamCellMember = new ExamCell({
      employeeId: req.body.employeeId,
      salutation: req.body.salutation,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    })

    const examCellMember = await newExamCellMember.save();
    res.status(201).json(examCellMember);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PUT api/admin/exam_cell/:_id
// @desc    Edit examcell member
// @access  Private
router.put("/:_id", [param("_id").custom(value => {
  // Custom validator to check if id is a valid object id
  if (!isValidObjectId(value)) {
    throw new Error("ID is not valid")
  }
  return true
}),
// Check req.body content
body('employeeId', 'Employee Id is required').notEmpty(),
body('employeeId', 'Employee Id is not valid').isString(),
body('salutation', 'Salutation is required').notEmpty(),
body('salutation', 'Salutation is not valid').isIn(["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."]).isString(),
body('firstName', "First name is required").notEmpty(),
body('firstName', "First name is not valid").isString(),
body('lastName', "Last name is required").notEmpty(),
body('firstName', "Last name is not valid").isString(),
body('email', "Email is required").notEmpty(),
body('email', "Email is not valid").isEmail().isString(),
body('phoneNumber', "Phone number is required").notEmpty(),
body('phoneNumber', "Phone number is not valid").isMobilePhone("en-IN").isString()], async (req, res) => {
  try {
    // Check if express-validator threw errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { _id } = req.params;

    // Find the examcell member by id and update
    const updatedExamCellMemberData = await ExamCell.findByIdAndUpdate(_id, {
      employeeId: req.body.employeeId,
      salutation: req.body.salutation,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    }, { new: true })
    if (!updatedExamCellMemberData) return res.status(404).json({ error: "Exam Cell member not found" })

    res.status(200).json(updatedExamCellMemberData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE api/admin/exam_cell/:_id
// @desc    Delete examcell member
// @access  Private
router.delete("/:_id", param("_id").custom(value => {
  // Custom validator to check if id is a valid object id
  if (!isValidObjectId(value)) {
    throw new Error("ID is not valid")
  }
  return true
}), async (req, res) => {
  try {
    // Check if express-validator threw errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
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