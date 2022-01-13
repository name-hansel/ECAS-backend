var express = require('express');
var router = express.Router();

const adminAuthRouter = require("../controller/admin/auth")
const examCellRouter = require("../controller/admin/examcell")

router.use("/auth", adminAuthRouter)
router.use("/exam-cell", examCellRouter)

module.exports = router;