var express = require('express');
var router = express.Router();

const { adminAuthMiddleware } = require("../utils/authMiddleware")

const adminAuthRouter = require("../controller/admin/auth")
const examCellRouter = require("../controller/admin/examcell")

router.use("/auth", adminAuthRouter)
router.use("/exam_cell", adminAuthMiddleware, examCellRouter)

module.exports = router;