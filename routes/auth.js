const express = require("express")
const router = express.Router()

const jwt = require("jsonwebtoken")

// @route   GET /api/auth/
// @desc    Load user
// @access  Public
router.get("/", (req, res) => {
  try {
    if (!req.cookies['access-token']) return res.status(400).json({
      message: "Not logged in"
    })

    const user = jwt.verify(req.cookies['access-token'], process.env.ACCESS_TOKEN_SECRET)

    res.status(200).json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      error: "Server error"
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user, clear cookies
// @access  Public
router.post("/logout", (req, res) => {
  const options = {
    expires: new Date(),
    httpOnly: true,
    domain: "localhost",
    path: "/",
    sameSite: "lax",
    secure: false,
  }
  res.cookie("access-token", "", options);
  res.status(200).json({
    message: "Logged out successfully!",
  });
})

// @route   GET /api/auth/google/:role
// @desc    Handle Google OAuth redirect, set cookie, and return user
// @access  Public

module.exports = router