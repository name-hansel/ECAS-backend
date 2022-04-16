const express = require('express');
const router = express.Router();

const { studentAuthMiddleware } = require('../utils/authMiddleware');

const noticeRouter = require("../controller/student/notice");
const faqRouter = require("../controller/student/faq");
const queryRouter = require("../controller/student/query");

router.use("/notice", studentAuthMiddleware, noticeRouter);
router.use("/faq", studentAuthMiddleware, faqRouter);
router.use("/query", studentAuthMiddleware, queryRouter);

module.exports = router;