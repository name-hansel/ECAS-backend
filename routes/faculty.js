const express = require('express');
const router = express.Router();

const { facultyAuthMiddleware } = require('../utils/authMiddleware');
const facultyRouter = require("../controller/faculty/quiz");
const courseRouter = require("../controller/faculty/course");
const noticeRouter = require("../controller/faculty/notice");

router.use("/quiz", facultyAuthMiddleware, facultyRouter);
router.use("/course", facultyAuthMiddleware, courseRouter);
router.use("/notice", facultyAuthMiddleware, noticeRouter);

module.exports = router;