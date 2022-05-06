const express = require("express")
const router = express.Router()

const axios = require("axios")
const jwt = require("jsonwebtoken")
const qs = require("querystring")

const ExamCell = require("../models/ExamCell")
const Student = require("../models/Student")
const Faculty = require("../models/Faculty")

// @route   GET /api/auth/
// @desc    Load user
// @access  Public
router.get("/", (req, res) => {
  try {
    if (!req.cookies['access-token']) return res.status(400).json({
      message: "Not logged in"
    })

    const user = jwt.verify(req.cookies['access-token'], process.env.ACCESS_TOKEN_SECRET)

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      picture: user.picture,
    }

    if (user.role === "student") {
      userData['branch'] = user.branch;
      userData['year'] = user.year;
      userData['semester'] = user.semester;
      userData['division'] = user.division;
      userData['branchName'] = user.branchName;
    }

    res.status(200).json(userData);
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
  try {
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
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      error: "Server error"
    })
  }
})

// @route   GET /api/auth/google/:role
// @desc    Handle Google OAuth redirect, set cookie, and return user
// @access  Public
router.get("/google/:role", async (req, res) => {
  try {
    // Get role
    const { role } = req.params;

    // Get code from query
    const code = req.query.code;

    // Fetch token and id
    const url = 'https://oauth2.googleapis.com/token'
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.GOOGLE_OAUTH_REDIRECT_URL}/${role}`,
      grant_type: 'authorization_code'
    }

    const { data: { id_token, access_token } } = await axios.post(url, qs.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    // Get user details by decoding token
    const user = jwt.decode(id_token)

    // Find user in database
    const userData = role === "exam_cell" ? await ExamCell.findOne({ email: user.email }) : role === "student" ? await Student.findOne({ email: user.email, archived: false }).populate('branch') : await Faculty.findOne({
      email: user.email, archived: false
    });
    if (!userData) return res.redirect("http://localhost:3000?error=user_not_found")

    const accessTokenData = {
      _id: userData._id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      picture: user.picture,
      role
    }

    // Add currentYear and branch to accessTokenData if user is a student
    if (accessTokenData.role === "student") {
      accessTokenData['branch'] = userData.branch._id;
      // Get year from semester
      accessTokenData['year'] = Math.ceil(userData.currentSemester / 2);
      accessTokenData['semester'] = userData.currentSemester;
      accessTokenData['division'] = userData.currentDivision;
      accessTokenData['branchName'] = userData.branch.name;
    }

    // Create a jwt with user id and role
    const accessToken = await jwt.sign(
      accessTokenData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 900000 }
    );

    // Create object with cookie options
    const options = {
      maxAge: 900000, // 15 mins
      httpOnly: true,
      domain: "localhost",
      path: "/",
      sameSite: "lax",
      secure: false,
    }
    // Set cookies
    res.cookie("access-token", accessToken, options);
    // Redirect back to client
    res.redirect("http://localhost:3000")
  } catch (e) {
    console.error(e.message)
    res.redirect("http://localhost:3000?error=server_error")
  }
})

// @route   GET /api/auth/dev/:role
// @desc    Get cookie
// @access  Public
// !ONLY FOR DEV USE
router.post("/dev/:role", async (req, res) => {
  try {
    const { email } = req.body;
    const { role } = req.params;
    const user = role === "exam_cell" ? await ExamCell.findOne({ email }) : role === "student" ? await Student.findOne({ email, archived: false }).populate('branch') : await Faculty.findOne({ email, archived: false })

    if (!user) return res.status(404).json({ message: "User not found" })

    const accessTokenData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      picture: user.picture,
      role
    }

    // Add currentYear and branch to accessTokenData if user is a student
    if (accessTokenData.role === "student") {
      accessTokenData['branch'] = user.branch._id;
      accessTokenData['branchName'] = user.branch.name;
      // Get year from semester
      accessTokenData['year'] = Math.ceil(user.currentSemester / 2);
    }

    // Create a jwt with user id and role
    const accessToken = await jwt.sign(
      accessTokenData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 900000 }
    );

    // Create object with cookie options
    const options = {
      maxAge: 900000, // 15 mins
      httpOnly: true,
      domain: "localhost",
      path: "/",
      sameSite: "lax",
      secure: false,
    }

    // Set cookies
    res.cookie("access-token", accessToken, options);
    res.send("Cookie set")
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      error: "Server error"
    })
  }
})

module.exports = router