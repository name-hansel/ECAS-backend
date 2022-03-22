const express = require('express');
const router = express.Router();

const { studentAuthMiddleware } = require('../utils/authMiddleware');

const noticeRouter = require("../controller/student/notice");

router.use("/notice", studentAuthMiddleware, noticeRouter);

module.exports = router;