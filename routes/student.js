const express = require('express');
const router = express.Router();

const { studentAuthMiddleware } = require('../utils/authMiddleware');

const noticeRouter = require("../controller/student/notice");
const faqRouter = require("../controller/student/faq")

router.use("/notice", studentAuthMiddleware, noticeRouter);
router.use("/faq", studentAuthMiddleware, faqRouter);

module.exports = router;