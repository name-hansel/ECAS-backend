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

const findThread = (threadId) => {
  const { active_worker_threads } = WorkerThreads.getInstance();
  for (let i = 0; i < active_worker_threads.length; i++) {
    if (active_worker_threads[i].threadId === threadId) return i;
  }
  return -1;
}

// @route   GET /api/faculty/quiz
// @desc    Get all quiz by a faculty
// @access  Private
router.get("/", async (req, res) => {
  try {
    const quizData = await Quiz.find({ faculty: req._id }).populate('course', 'name code semester');
    res.status(200).json(quizData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/faculty/quiz
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

    const { course, title, numberOfQuestionsInQuiz, rows, columns, numberOfStudents, division } = req.body;
    const faculty = req._id;

    // Convert title to lowercase and URL encode to save in S3 bucket
    const lowerTitle = encodeURI(title.toLowerCase());
    const questionsFileName = `${lowerTitle}_questions.csv`

    // Create quiz instance
    const newQuiz = new Quiz({
      faculty, course, title, numberOfQuestionsInQuiz, rows, columns, numberOfStudents, questionsFile: questionsFileName, division
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
    await newQuiz.populate('course', 'code name semester');
    newQuiz.semester = newQuiz.course.semester;
    await newQuiz.save();
    await newQuiz.populate('faculty', 'firstName lastName');

    res.status(200).json(newQuiz);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/faculty/quiz/:_id/result
// @desc    Add quiz result
// @access  Private
router.post("/:_id/result", idValidator, upload.fields([{
  name: 'resultFile', maxCount: 1
}]), async (req, res) => {
  try {
    // Check if result file is present
    if (req.files['resultFile'] === undefined) return res.status(400).json({
      error: 'Results .csv file required'
    })

    const { _id } = req.params;
    const quizData = await Quiz.findById(_id);

    if (!quizData) return res.status(404).json({ error: 'Quiz not found' });

    // Upload file to AWS S3
    const lowerTitle = encodeURI(quizData.title.toLowerCase());
    const resultFileName = `${lowerTitle}_result.csv`

    await s3.putObject({
      Body: req.files['resultFile'][0].buffer,
      Bucket: process.env.QUIZ_BUCKET_NAME,
      Key: resultFileName
    }).promise();

    quizData.resultFile = resultFileName;
    await quizData.save();
    await quizData.populate('course', 'code name semester');
    await quizData.populate('faculty', 'firstName lastName');
    res.status(200).json(quizData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PUT /api/faculty/quiz/:_id
// @desc    Publish result
// @access  Private
router.put("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const quizData = await Quiz.findById(_id).populate('course', 'name code semester');

    if (!quizData) return res.status(404).json({ error: 'Quiz not found' });
    if (quizData.resultPublish) return res.status(400).json({ error: 'Result has already been published.' });

    quizData.resultPublish = true;
    await quizData.save();
    res.status(200).json(quizData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/faculty/quiz/:_id/result
// @desc    Delete quiz result
// @access  Private
router.delete("/:_id/result", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const quizData = await Quiz.findById(_id).populate('course', 'name code semester');
    if (!quizData) return res.status(404).json({ error: 'Quiz not found' });

    if (quizData.resultPublish) return res.status(400).json({ error: 'Result has already been published.' })

    quizData.resultFile = null;
    await quizData.save();
    res.status(200).json(quizData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/faculty/quiz/:_id
// @desc    Delete quiz task
// @access  Private
router.delete("/:_id", idValidator, async (req, res) => {
  try {
    const { active_worker_threads } = WorkerThreads.getInstance();
    const { _id } = req.params;
    const quizData = await Quiz.findByIdAndDelete(_id);
    if (!quizData) return res.status(404).json({
      error: 'Quiz not found'
    })

    // Terminate thread
    if (!quizData.complete && !quizData.failed) {
      const index = findThread(quizData.threadId);
      const thread = active_worker_threads[index];
      thread.on("exit", code => console.info(`Worker exited with code ${code}`));
      if (index !== -1) {
        // Terminate worker thread
        await thread.terminate();
        // Remove thread from array
        active_worker_threads.splice(index, 1);
      }
    }

    // Delete input files and solution file
    // Delete files from AWS S3
    const Objects = [];
    Objects.push({
      Key: quizData.questionsFile
    })

    if (quizData.resultFile)
      Objects.push({
        Key: quizData.resultFile
      })

    const params = {
      Bucket: process.env.QUIZ_BUCKET_NAME,
      Delete: {
        Objects: Objects
      }
    }

    await s3.deleteObjects(params).promise();

    // If solution is present, delete it also
    if (quizData.complete) {
      await s3.deleteObject({
        Bucket: process.env.QUIZ_BUCKET_NAME,
        Key: quizData.solutionFile
      }).promise();
    }
    res.status(204).end();
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;