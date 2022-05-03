const express = require('express');
const router = express.Router();

const { facultyAuthMiddleware } = require('../utils/authMiddleware');
const facultyRouter = require("../controller/faculty/quiz");

router.use("/quiz", facultyAuthMiddleware, facultyRouter);

module.exports = router;