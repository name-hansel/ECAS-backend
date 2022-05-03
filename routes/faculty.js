const express = require('express');
const router = express.Router();

const { facultyAuthMiddleware } = require('../utils/authMiddleware');
const facultyRouter = require("../controller/faculty/quiz");
const courseRouter = require("../controller/faculty/course");

router.use("/quiz", facultyAuthMiddleware, facultyRouter);
router.use("/course", facultyAuthMiddleware, courseRouter);

module.exports = router;