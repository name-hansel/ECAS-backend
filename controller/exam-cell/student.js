const express = require("express");
const router = express.Router();

const Student = require("../../models/Student")
const { studentValidator, idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/exam_cell/student/:_id
// @desc    Get student by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const studentData = await Student.findOne({ _id, archived: false }).populate('branch')

    if (!studentData) return res.status(404).json({
      error: 'Student not found'
    })

    res.status(200).json(studentData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/student
// @desc    Get all students
// @access  Private
router.get("/", async (req, res) => {
  try {
    const studentData = await Student.find().populate('branch');
    const sortedStudentData = {
      active: [],
      archived: []
    };
    studentData.forEach((student) => student.archived ? sortedStudentData.archived.push(student) : sortedStudentData.active.push(student))

    res.status(200).json(sortedStudentData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/student
// @desc    Add new student
// @access  Private
router.post("/", studentValidator, async (req, res) => {
  try {
    const studentData = new Student({
      admissionNumber: req.body.admissionNumber,
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      branch: req.body.branch,
      currentSemester: req.body.currentSemester,
      currentDivision: req.body.currentDivision,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    })
    const newStudent = await studentData.save();
    await newStudent.populate('branch')
    res.status(201).json(newStudent);
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
          msg: `A student with this data already exists`
        }]
      })
    }
  }
})

// @route   PUT /api/exam_cell/student/:_id
// @desc    Edit student
// @access  Private
router.put("/:_id", idValidator, studentValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const updatedStudent = await Student.findByIdAndUpdate(_id, {
      admissionNumber: req.body.admissionNumber,
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      branch: req.body.branch,
      currentSemester: req.body.currentSemester,
      currentDivision: req.body.currentDivision,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    }, { new: true }).populate('branch')

    if (!updatedStudent) return res.status(404).json({
      error: "Student not found"
    })
    res.status(200).json(updatedStudent)
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
          msg: `A student with this data already exists`
        }]
      })
    }
  }
})

// @route   PATCH /api/exam_cell/student/:_id
// @desc    Archive/unarchive student
// @access  Private
router.patch("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const studentData = await Student.findById(_id)
    if (!studentData) return res.status(404).json({
      error: "Student not found"
    })

    studentData.archived = !studentData.archived;
    await studentData.save();
    res.status(200).json(studentData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router