const express = require("express");
const router = express.Router();

const AcademicSession = require("../../models/AcademicSession")
const { academicSessionValidator, idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/exam_cell/academic_session/:_id
// @desc    Get academic session by id
// @access  Private
router.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const academicSessionData = await AcademicSession.find({ archived: false });
    res.status(200).json(academicSessionData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/academic_session
// @desc    Get all academic sessions
// @access  Private
router.get("/", async (req, res) => {
  try {
    const academicSessionData = await AcademicSession.find();
    res.status(200).json(academicSessionData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/academic_session
// @desc    Add an academic session
// @access  Private
router.post("/", academicSessionValidator, async (req, res) => {
  try {
    const { from, to, session } = req.body;
    const newAcademicSessionData = new AcademicSession({
      from, to, session
    })

    const academicSession = await newAcademicSessionData.save();
    res.status(201).json(academicSession);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PATCH /api/exam_cell/academic_session/active/:_id
// @desc    Set academic session as active
// @access  Private
router.patch("/active/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;

    // Get current active academic session and set it as inactive
    // active = false
    await AcademicSession.findOneAndUpdate({ active: true }, { active: false })

    // Find the academic session we want to set as active
    const academicSessionData = await AcademicSession.findById(_id);
    if (!academicSessionData) return res.status(404).json({ error: "Academic session not found" })

    // Set it to active
    academicSessionData.active = true;
    await academicSessionData.save();

    res.status(200).json(academicSessionData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PATCH /api/exam_cell/academic_session/archive/:_id
// @desc    Archive an academic session
// @access  Private
router.patch("/archive/:_id", idValidator, async (req, res) => {
  try {
    // TODO
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PUT /api/exam_cell/academic_session/:_id
// @desc    Edit academic session
// @access  Private
// router.put("/:_id", idValidator, academicSessionValidator, async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const updatedAcademicSessionData = await AcademicSession.findByIdAndUpdate(_id, {
//       from: req.body.from,
//       to: req.body.to,
//       session: req.body.session,
//       current: req.body.current,
//     }, { new: true });

//     // Return 404 error if academic session with id not found
//     if (!updatedAcademicSessionData) return res.status(404).json({
//       error: 'Academic session not found'
//     })

//     res.status(200).json(updatedAcademicSessionData)
//   } catch (err) {
//     console.error(err.message);
//     return res.status(500).json({
//       error: "Server error",
//     });
//   }
// })

module.exports = router;