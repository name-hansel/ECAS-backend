const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.status(200).json({
    role: "admin"
  })
  // Send user details here if cookie is present
  // Send error if not.
})

// Logout route
// Google OAuth route

module.exports = router