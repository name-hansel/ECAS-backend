const express = require("express");
const router = express.Router();

const { Worker, SHARE_ENV } = require("worker_threads");
const AWS = require("aws-sdk");
const multer = require('multer');

const SeatingArrangement = require("../../models/SeatingArrangement");
const { seatingArrangementValidator, idValidator } = require("../../utils/validationMiddleware");
const WorkerThreads = require("../../config/worker_threads_singleton");

const s3 = new AWS.S3();
const upload = multer();

const findThread = (threadId) => {
  const { active_worker_threads } = WorkerThreads.getInstance();
  for (let i = 0; i < active_worker_threads.length; i++) {
    if (active_worker_threads[i].threadId === threadId) return i;
  }
  return -1;
}

// SA -> Seating Arrangement

// @route   GET /api/exam_cell/seating
// @desc    Get all SA 
// @access  Private
router.get("/", async (req, res) => {
  try {
    const SAData = await SeatingArrangement.find();
    res.status(200).json(SAData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/seating
// @desc    Add new SA task
// @access  Private
router.post("/", upload.fields([{
  name: 'studentFile', maxCount: 1
}, {
  name: 'courseFile', maxCount: 1
}, {
  name: 'roomFile', maxCount: 1
}]), seatingArrangementValidator, async (req, res) => {
  try {
    const { active_worker_threads } = WorkerThreads.getInstance();
    // Check already running worker threads
    // Maximum of 5 allowed
    if (active_worker_threads.length >= 5)
      return res.status(400).json({
        error: 'Server is busy.'
      })

    // Check if all files are present
    if (req.files['studentFile'] === undefined) return res.status(400).json({
      error: 'Student details .csv file required'
    })

    if (req.files['courseFile'] === undefined) return res.status(400).json({
      error: 'Course details .csv file required'
    })

    if (req.files['roomFile'] === undefined) return res.status(400).json({
      error: 'Room details .csv file required'
    })

    const { title, dateOfExam } = req.body;

    // Convert title to lowercase and URL encode to save in S3 bucket
    const lowerTitle = encodeURI(title.toLowerCase());

    // TODO Check if dateOfExam is in the past

    // Create SA instance
    const newSeatingArrangement = new SeatingArrangement({
      title, dateOfExam
    })
    await newSeatingArrangement.save();

    // Upload files to AWS
    // Upload student details
    const studentFileName = `${lowerTitle}_student.csv`
    await s3.putObject({
      Body: req.files['studentFile'][0].buffer,
      Bucket: process.env.SA_BUCKET_NAME,
      Key: studentFileName
    }).promise();

    // Upload course details
    const courseFileName = `${lowerTitle}_course.csv`
    await s3.putObject({
      Body: req.files['courseFile'][0].buffer,
      Bucket: process.env.SA_BUCKET_NAME,
      Key: courseFileName
    }).promise();

    // Upload room details
    const roomFileName = `${lowerTitle}_room.csv`
    await s3.putObject({
      Body: req.files['roomFile'][0].buffer,
      Bucket: process.env.SA_BUCKET_NAME,
      Key: roomFileName
    }).promise();

    // Add file names to SA instance
    newSeatingArrangement.studentFile = studentFileName;
    newSeatingArrangement.courseFile = courseFileName;
    newSeatingArrangement.roomFile = roomFileName;

    const workerData = {
      _id: newSeatingArrangement._id.toString(), studentFileName, courseFileName, roomFileName, lowerTitle, createdByEmail: req.user_email, title
    }

    const thread = new Worker("./genetic_algorithm/main.js", {
      workerData, env: SHARE_ENV
    })

    // Add thread to array
    active_worker_threads.push(thread);

    // Add threadId to SA instance
    newSeatingArrangement.threadId = thread.threadId;
    await newSeatingArrangement.save();

    res.status(200).json(newSeatingArrangement);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/exam_cell/seating/:_id
// @desc    Delete SA task
// @access  Private
router.delete("/:_id", idValidator, async (req, res) => {
  try {
    const { active_worker_threads } = WorkerThreads.getInstance();
    const { _id } = req.params;
    const seatingArrangementData = await SeatingArrangement.findByIdAndDelete(_id);
    if (!seatingArrangementData) return res.status(404).json({
      error: 'Seating arrangement not found'
    })

    // Terminate thread
    if (!seatingArrangementData.complete) {
      const index = findThread(seatingArrangementData.threadId);
      const thread = active_worker_threads[index];
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
    const lowerTitle = encodeURI(seatingArrangementData.title.toLowerCase());
    [`${lowerTitle}_student.csv`, `${lowerTitle}_course.csv`, `${lowerTitle}_room.csv`].forEach(file => {
      Objects.push({
        Key: file
      })
    });

    const params = {
      Bucket: process.env.SA_BUCKET_NAME,
      Delete: {
        Objects: Objects
      }
    }

    await s3.deleteObjects(params).promise();

    // If solution is present, delete it also
    if (seatingArrangementData.complete) {
      await s3.deleteObject({
        Bucket: process.env.SA_BUCKET_NAME,
        Key: `${lowerTitle}_solution.csv`
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