const express = require("express");
const router = express.Router();

const Course = require("../../models/Course")
const { courseValidator, idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/exam_cell/course/:_id
// @desc    Get course by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const courseData = await Course.findById({ _id, archived: false }).populate('branch', 'code name');

    if (!courseData) return res.status(404).json({
      error: 'Course not found'
    })

    res.status(200).json(courseData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/course
// @desc    Get all courses
// @access  Private
router.get("/", async (req, res) => {
  try {
    const courseData = await Course.find().populate('branch', 'code name');
    const sortedCourseData = {
      archived: [],
      active: []
    };
    for (let i = 0; i < courseData.length; i++) {
      courseData[i].archived ? sortedCourseData.archived.push(courseData[i]) : sortedCourseData.active.push(courseData[i])
    }
    res.status(200).json(sortedCourseData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/course
// @desc    Add new course
// @access  Private
router.post("/", courseValidator, async (req, res) => {
  try {
    const { code, name, semester, branch, mandatory } = req.body;
    const newCourse = new Course({
      code, name, semester, branch, mandatory
    });
    const courseData = await newCourse.save();
    await courseData.populate('branch', 'code name');
    res.status(201).json(courseData);
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
          msg: `A course with this data already exists`
        }]
      })
    }
  }
})

// @route   PUT /api/exam_cell/course/:_id
// @desc    Edit course
// @access  Private
router.put("/:_id", idValidator, courseValidator, async (req, res) => {
  try {
    const { code, name, semester, branch, mandatory } = req.body;
    const { _id } = req.params;

    // Find course by id and update
    const updatedCourse = await Course.findByIdAndUpdate(_id, {
      code, name, semester, branch, mandatory
    }, { new: true }).populate('branch', 'code name');;

    if (!updatedCourse) return res.status(404).json({
      error: "Course not found"
    });
    res.status(200).json(updatedCourse);
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
          msg: `A course with this data already exists`
        }]
      })
    }
  }
})

// @route   PATCH /api/exam_cell/course/:_id
// @desc    Archive/unarchive course
// @access  Private
router.patch("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const courseData = await Course.findById(_id).populate('branch', 'code name');
    if (!courseData) return res.status(404).json({
      error: "Course not found"
    })

    courseData.archived = !courseData.archived;
    await courseData.save();
    res.status(200).json(courseData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;