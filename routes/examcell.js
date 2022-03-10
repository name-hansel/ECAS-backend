const express = require('express');
const router = express.Router();

const { examCellAuthMiddleware } = require('../utils/authMiddleware');
const branchRouter = require("../controller/exam-cell/branch")
const studentRouter = require("../controller/exam-cell/student")

router.use("/branch", examCellAuthMiddleware, branchRouter);
router.use("/student", examCellAuthMiddleware, studentRouter);


module.exports = router;