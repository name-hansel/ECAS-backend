const express = require('express');
const router = express.Router();

const { examCellAuthMiddleware } = require('../utils/authMiddleware');
// const academicSessionRouter = require("../controller/examCell/academicSession")

// router.use("/academic_session", examCellAuthMiddleware, academicSessionRouter);

module.exports = router;