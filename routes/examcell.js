const express = require('express');
const router = express.Router();

const { examCellAuthMiddleware } = require('../utils/authMiddleware');
const branchRouter = require("../controller/exam-cell/branch");
const studentRouter = require("../controller/exam-cell/student");
const facultyRouter = require("../controller/exam-cell/faculty");
const noticeRouter = require("../controller/exam-cell/notice");
const faqRouter = require("../controller/exam-cell/faq");
const seatingRouter = require("../controller/exam-cell/seating");
const queryRouter = require("../controller/exam-cell/query");
const courseRouter = require("../controller/exam-cell/course");

router.use("/branch", examCellAuthMiddleware, branchRouter);
router.use("/student", examCellAuthMiddleware, studentRouter);
router.use("/faculty", examCellAuthMiddleware, facultyRouter);
router.use("/notice", examCellAuthMiddleware, noticeRouter);
router.use("/faq", examCellAuthMiddleware, faqRouter);
router.use("/seating", examCellAuthMiddleware, seatingRouter);
router.use("/query", examCellAuthMiddleware, queryRouter);
router.use("/course", examCellAuthMiddleware, courseRouter);

module.exports = router;