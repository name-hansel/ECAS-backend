const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Setting = require("../../models/Setting")

const { adminAuthMiddleware } = require("../../utils/authMiddleware")

// @route   POST /auth/login
// @desc    Login as admin
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length === 0) return res.status(400).send("Invalid password")

    // Get current admin password
    const { value } = await Setting.findOne({ key: "adminPassword" })
    if (!value) return res.status(500).json({ error: "Something went wrong" })

    const match = await bcrypt.compare(password, value);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const payload = {
      role: "admin"
    }

    const accessToken = await jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
    );

    const options = {
      maxAge: 1800000, // 30 mins
      httpOnly: true,
      domain: "localhost",
      path: "/",
      sameSite: "lax",
      secure: false,
    }

    // Set cookie
    res.cookie("access-token", accessToken, options);
    res.status(200).json({
      message: "Logged in successfully!"
    })
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /auth/change-password
// @desc    Change admin password
// @access  Public
router.post("/change-password", adminAuthMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || oldPassword.length === 0) return res.status(400).json({ error: "Invalid old password" })
    if (!newPassword || newPassword.length === 0) return res.status(400).json({ error: "Invalid new password" })

    // Get current admin password
    const adminPassword = await Setting.findOne({ key: "adminPassword" });
    if (!adminPassword.value) return res.status(500).json({ error: "Something went wrong" })

    // Check if oldPassword matches password in database
    const match = await bcrypt.compare(oldPassword, adminPassword.value)
    if (!match) return res.status(400).json({ error: "Invalid password" })

    // Hash and update password in database
    const salt = await bcrypt.genSalt(10);
    const newPasswordHashed = await bcrypt.hash(newPassword, salt);
    adminPassword.value = newPasswordHashed;
    await adminPassword.save();

    res.status(200).json({ message: "Password changed!" })
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;