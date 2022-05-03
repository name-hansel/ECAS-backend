const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const initializeGA = require("./config/restartGA");
// const { initializeModel } = require("./config/QnA_model");
// const { getPassage } = require("./utils/changePassage")

const app = express();
require("dotenv").config();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

// Database connection
const connectToDatabase = require("./config/database")
connectToDatabase().then(initializeGA)//.then(initializeModel).then(getPassage)

const commonAuthRouter = require("./routes/auth")
const adminRouter = require("./routes/admin")
const examCellRouter = require("./routes/examCell")
const studentRouter = require("./routes/student")
const facultyRouter = require("./routes/faculty")
const publicRouter = require("./routes/public")

// Routes
app.use("/api/auth", commonAuthRouter);
app.use("/api/admin", adminRouter);
app.use("/api/exam_cell", examCellRouter);
app.use("/api/student", studentRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/public", publicRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})