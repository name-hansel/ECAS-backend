const express = require("express");
const router = express.Router();

const Faculty = require("../../models/Faculty")
const { facultyValidator, idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/exam_cell/faculty/:_id
// @desc    Get faculty by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const facultyData = await Faculty.findOne({ _id, archived: false })

    if (!facultyData) return res.status(404).json({
      error: 'Faculty not found'
    })

    res.status(200).json(facultyData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/faculty
// @desc    Get all faculties
// @access  Private
router.get("/", async (req, res) => {
  try {
    const facultyData = await Faculty.find();
    res.status(200).json(facultyData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/faculty
// @desc    Add new faculty
// @access  Private
router.post("/", facultyValidator, async (req, res) => {
  try {
    const facultyData = new Faculty({
      employeeId: req.body.employeeId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      department: req.body.department
    })
    const newFaculty = await facultyData.save();
    res.status(201).json(newFaculty);
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
          msg: `A branch with this data already exists`
        }]
      })
    }
  }
})

// @route   PUT /api/exam_cell/faculty/:_id
// @desc    Edit faculty
// @access  Private
router.put("/:_id", idValidator, facultyValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const updatedFaculty = await Faculty.findByIdAndUpdate(_id, {
      employeeId: req.body.employeeId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      department: req.body.department
    }, { new: true })

    if (!updatedFaculty) return res.status(404).json({
      error: "Faculty not found"
    })
    res.status(200).json(updatedFaculty)
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
          msg: `A branch with this data already exists`
        }]
      })
    }
  }
})

// @route   PATCH /api/exam_cell/faculty/:_id
// @desc    Archive/unarchive faculty
// @access  Private
router.patch("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const facultyData = await Faculty.findById(_id)
    if (!facultyData) return res.status(404).json({
      error: "Faculty not found"
    })

    facultyData.archived = !facultyData.archived;
    await facultyData.save();
    res.status(200).json(facultyData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router