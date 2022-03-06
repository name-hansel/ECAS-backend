const express = require("express");
const router = express.Router();

const Branch = require("../../models/Branch")
const { branchValidator, idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/exam_cell/academic_session
// @desc    Get all academic sessions
// @access  Private

module.exports = router