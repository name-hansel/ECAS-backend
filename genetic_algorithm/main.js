const { workerData, threadId, parentPort } = require("worker_threads");
const mongoose = require("mongoose");

// Database connection
const connectToDatabase = require("./database");
const SeatingArrangement = require("../models/SeatingArrangement")

const getFiles = require("./utils/getFiles");
const parseCSV = require("./utils/parseCSV");
const geneticAlgorithm = require("./GA");

// Terminate thread
parentPort.on("message", (data) => {
  if (data === "terminate") {
    mongoose.disconnect();
    console.log('Exiting thread...')
    process.exit(0);
  } else {
    console.log(data);
  }
})

const geneticAlgorithmStart = async () => {
  try {
    console.log(`In thread ${threadId}`);
    console.log(workerData);

    // Get files
    const { studentFile, courseFile, roomFile } = await getFiles(workerData.studentFileName, workerData.courseFileName, workerData.roomFileName);

    // Parse .csv files
    const { studentDetails, roomDetails, courseDetails } = parseCSV(studentFile, courseFile, roomFile);

    // Do GA work here
    console.log(`Starting GA in thread${threadId}`);
    const { solution, fitness } = geneticAlgorithm(studentDetails, roomDetails, courseDetails);
    console.log(`Finished GA in thread${threadId}`);
    console.log(solution);

    // Array to .csv file

    // Upload solution to AWS

    const solutionFileName = `${workerData.lowerTitle}_solution.csv`


    // Connect to database
    await connectToDatabase(threadId);
    // Update solution filename and close
    await SeatingArrangement.findByIdAndUpdate(workerData._id, {
      $set: {
        complete: true,
        solutionFile: solutionFileName
      }
    });

    await mongoose.disconnect();
    console.log(`Done with work in thread ${threadId}. Exiting...`);
  } catch (err) {
    console.log(err.message);
    // Set fail to true
    await SeatingArrangement.findByIdAndUpdate(workerData._id, {
      $set: {
        failed: true
      }
    })
    await mongoose.disconnect();
    process.exit(1);
  }
}

geneticAlgorithmStart();