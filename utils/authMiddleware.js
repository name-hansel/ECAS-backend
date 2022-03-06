const jwt = require("jsonwebtoken")

const adminAuthMiddleware = (req, res, next) => {
  try {
    // Check cookie
    if (!req.cookies['access-token'])
      return res.status(401).json({
        error: "Please log in"
      })

    const accessToken = req.cookies['access-token']

    // Check if access token is valid
    const { role } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

    // Check if role is admin
    if (role !== "admin") return res.status(403).send({ "error": "Please login as admin" })

    next();
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error"
    })
  }
}

const examCellAuthMiddleware = (req, res, next) => {
  try {
    // Check cookie
    if (!req.cookies['access-token'])
      return res.status(401).json({
        error: "Please log in"
      })

    const accessToken = req.cookies['access-token']

    // Check if access token is valid
    const { role } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

    // Check if role is exam cell
    if (role !== "exam_cell") return res.status(403).send({ "error": "Please login as Exam Cell" })

    next();
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error"
    })
  }
}

module.exports = {
  adminAuthMiddleware, examCellAuthMiddleware
}