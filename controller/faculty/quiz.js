const express = require("express");
const router = express.Router();

const { Worker, SHARE_ENV } = require("worker_threads");
const AWS = require("aws-sdk");
const multer = require('multer');
const s3 = new AWS.S3();
const upload = multer();

const { quizValidator, idValidator } = require("../../utils/validationMiddleware");
const Quiz = require("../../models/Quiz");
const WorkerThreads = require("../../config/worker_threads_singleton");

// @route   GET /api/faculty/quiz
// @desc    Get all quiz by a faculty
// @access  Private
router.get("/", async (req, res) => {
  try {
    const quizData = await Quiz.find({ faculty: req._id }).populate('course', 'name code');
    res.status(200).json(quizData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/faculty
// @desc    Add new quiz
// @access  Private
router.post("/", upload.fields([{
  name: 'questionsFile', maxCount: 1
}]), quizValidator, async (req, res) => {
  try {
    const { active_worker_threads } = WorkerThreads.getInstance();

    // Check already running worker threads
    // Maximum of 5 allowed
    if (active_worker_threads.length >= 5)
      return res.status(400).json({
        error: 'Server is busy.'
      })

    // Check if questionsFile is present
    if (req.files['questionsFile'] === undefined) return res.status(400).json({
      error: 'Questions .csv file required'
    })

    const { course, title, numberOfQuestionsInQuiz, rows, columns, numberOfStudents } = req.body;
    const faculty = req._id;

    // Convert title to lowercase and URL encode to save in S3 bucket
    const lowerTitle = encodeURI(title.toLowerCase());
    const questionsFileName = `${lowerTitle}_questions.csv`

    // Create quiz instance
    const newQuiz = new Quiz({
      faculty, course, title, numberOfQuestionsInQuiz, rows, columns, numberOfStudents, questionsFile: questionsFileName
    })
    await newQuiz.save();

    // Upload question file to AWS
    await s3.putObject({
      Body: req.files['questionsFile'][0].buffer,
      Bucket: process.env.QUIZ_BUCKET_NAME,
      Key: questionsFileName
    }).promise();

    // Add file names to quiz instance
    newQuiz.questionsFile = questionsFileName;

    const workerData = {
      _id: newQuiz._id.toString(), questionsFileName, createdByEmail: req.email, title, lowerTitle,
      rows, columns, numberOfStudents, numberOfQuestionsInQuiz
    }

    // Start GA
    const thread = new Worker("./quiz_genetic_algorithm/main.js", {
      workerData, env: SHARE_ENV
    })

    // Add thread to array
    active_worker_threads.push(thread);

    // Add threadId to quiz instance
    newQuiz.threadId = thread.threadId;
    await newQuiz.save();
    await newQuiz.populate('course', 'code name');
    await newQuiz.populate('faculty', 'firstName lastName');

    res.status(200).json(newQuiz);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;