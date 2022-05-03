const { workerData, threadId } = require("worker_threads");
const mongoose = require("mongoose");
const Papa = require("papaparse");
const nodemailer = require('nodemailer');

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// Database connection
const connectToDatabase = require("./database");
const Quiz = require("../models/Quiz");

// const getFiles = require("./utils/getFiles");
// const parseCSV = require("./utils/parseCSV");
// const geneticAlgorithm = require("./GA");

const geneticAlgorithmStart = async () => {
  try {
    console.log(`In thread ${threadId}`);
    // Get files
    const { studentFile, courseFile, roomFile } = await getFiles(workerData.studentFileName, workerData.courseFileName, workerData.roomFileName);

  } catch (err) {
    // Connect to database
    await connectToDatabase(threadId);
    console.error(err.message);
    // Set fail to true
    await Quiz.findByIdAndUpdate(workerData._id, {
      $set: {
        failed: true,
        threadId: null
      }
    })
    await mongoose.disconnect();

    // sendSeatingArrangementMail(workerData.createdByEmail, workerData.title, "", false);
    process.exit(1);
  }
}


geneticAlgorithmStart();