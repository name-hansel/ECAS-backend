var express = require('express');
var router = express.Router();

const adminAuthRouter = require("../controller/admin/auth")

router.use("/auth", adminAuthRouter)

module.exports = router;