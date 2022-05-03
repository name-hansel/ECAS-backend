const { workerData, threadId } = require("worker_threads");
const mongoose = require("mongoose");
const Papa = require("papaparse");
const nodemailer = require('nodemailer');

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// Database connection
const connectToDatabase = require("./database");
const SeatingArrangement = require("../models/SeatingArrangement");

const getFiles = require("./utils/getFiles");
const parseCSV = require("./utils/parseCSV");
const geneticAlgorithm = require("./GA");

const sendSeatingArrangementMail = (email, title, solution, success) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "pce_examcell@outlook.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const html = success ? `Seating Arrangement for ${title} has been generated. Download link: <a href="http://localhost:5000/api/public/seating/${solution}">${title} Seating Arrangement</a>` : `Seating Arrangement for ${title} has failed. Delete and try again.`;

  let mailOptions = {
    from: '"PCE Exam Cell " <pce_examcell@outlook.com>',
    to: email,
    html,
    subject: success ? `${title} seating arrangement is ready.` : `${title} seating arrangement has failed.`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log(info);
    }
  })
}

const geneticAlgorithmStart = async () => {
  try {
    console.log(`In thread ${threadId}`);

    // Get files
    const { studentFile, courseFile, roomFile } = await getFiles(workerData.studentFileName, workerData.courseFileName, workerData.roomFileName);

    // Parse .csv files
    const { studentDetails, roomDetails, courseDetails } = parseCSV(studentFile, courseFile, roomFile);

    // Do GA work here
    console.log(`Starting GA in thread ${threadId}`);
    const { solution } = geneticAlgorithm(studentDetails, roomDetails, courseDetails);
    console.log(`Finished GA in thread ${threadId}`);

    // Array to .csv file
    solution.unshift(["ROOM_NUMBER", "ROW_NUMBER", "COLUMN_NUMBER", "STUDENT_DETAILS"]);
    const csv = Papa.unparse(solution);
    const solutionFileName = `${workerData.lowerTitle}_solution.csv`;

    // Upload solution to AWS
    await s3.putObject({
      Body: csv,
      Bucket: process.env.SA_BUCKET_NAME,
      Key: solutionFileName
    }).promise();

    // Connect to database
    await connectToDatabase(threadId);
    // Update solution filename and close
    await SeatingArrangement.findByIdAndUpdate(workerData._id, {
      $set: {
        complete: true,
        solutionFile: solutionFileName,
        threadId: null
      }
    });

    await mongoose.disconnect();

    // Send email to workerData.createdByEmail that seating arrangement has been generated
    sendSeatingArrangementMail(workerData.createdByEmail, workerData.title, solutionFileName, true);

    console.log(`Done with work in thread ${threadId}. Exiting...`);
    // process.exit(0);
  } catch (err) {
    // Connect to database
    await connectToDatabase(threadId);
    console.error(err.message);
    // Set fail to true
    await SeatingArrangement.findByIdAndUpdate(workerData._id, {
      $set: {
        failed: true,
        threadId: null
      }
    })
    await mongoose.disconnect();

    sendSeatingArrangementMail(workerData.createdByEmail, workerData.title, "", false);
    process.exit(1);
  }
}

geneticAlgorithmStart();