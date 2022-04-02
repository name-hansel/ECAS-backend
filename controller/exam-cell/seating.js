const express = require("express");
const router = express.Router();

const { Worker } = require("worker_threads");
const AWS = require("aws-sdk");
const multer = require('multer');

const SeatingArrangement = require("../../models/SeatingArrangement")
const { seatingArrangementValidator, idValidator } = require("../../utils/validationMiddleware")

const s3 = new AWS.S3();
const upload = multer();
const threads = [];
const findThread = (threadId) => {
  for (let i = 0; i < threads.length; i++) {
    if (threads[i].threadId === threadId) return threads[i];
  }
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

    // Check if dateOfExam is in the past

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

    // Parse csv to JSON

    const workerData = {
      student: [1, 2, 4]
    }

    const thread = new Worker("./genetic_algorithm/main.js", {
      workerData
    })

    // Add thread to array
    threads.push(thread);

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
    const { _id } = req.params;
    const seatingArrangementData = await SeatingArrangement.findByIdAndDelete(_id);
    if (!seatingArrangementData) return res.status(404).json({
      error: 'Seating arrangement not found'
    })

    // Terminate thread
    if (!seatingArrangementData.complete) {
      const thread = findThread(seatingArrangementData.threadId);
      if (thread !== undefined) await thread.terminate();
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
        Key: `${lowerTitle}_solution`
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