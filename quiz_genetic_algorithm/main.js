const { workerData, threadId } = require("worker_threads");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// Database connection
const connectToDatabase = require("./database");
const Quiz = require("../models/Quiz");

const getFiles = require("./utils/getFiles");
const parseCSV = require("./utils/parseCSV");
const geneticAlgorithm = require("./GA");
const getPDF = require("./utils/getPDF");

const sendQuizEmail = (email, title, solution, success) => {
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

  const html = success ? `Question papers for ${title} have been generated. Download link: <a href="http://localhost:5000/api/public/quiz/${solution}">${title} Question Papers</a>` : `Generating question papers for ${title} has failed. Delete and try again.`;

  let mailOptions = {
    from: '"PCE Exam Cell " <pce_examcell@outlook.com>',
    to: email,
    html,
    subject: success ? `${title} is ready.` : `${title} has failed.`,
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
    // Get data from worker data
    const { title, lowerTitle, rows, columns, numberOfStudents, numberOfQuestionsInQuiz, _id
    } = workerData;

    console.log(`In quiz thread ${threadId}`);

    // Get files
    const questionsFile = await getFiles(workerData.questionsFileName);

    // Parse .csv files
    const questionsArray = parseCSV(questionsFile);

    // Array of questions
    const questions = questionsArray.map((question) => question[0])

    // Get number of questions in .csv file
    const totalNumberOfQuestions = questions.length;

    // Do GA work here
    console.log(`Starting quiz GA in thread ${threadId}`);

    const solution = geneticAlgorithm(questions, rows, columns, numberOfStudents, totalNumberOfQuestions, numberOfQuestionsInQuiz);

    console.log(`Finished quiz GA in thread ${threadId}`);

    // Convert to PDF using solution and questions
    const pdf = await getPDF(solution, questions, title);
    const solutionFileName = `${lowerTitle}_solution.pdf`;

    // Upload PDF to AWS S3
    await s3.putObject({
      Body: pdf,
      Bucket: process.env.QUIZ_BUCKET_NAME,
      Key: solutionFileName
    }).promise();

    // Connect to database
    await connectToDatabase(threadId);
    // Update solution filename and close
    await Quiz.findByIdAndUpdate(_id, {
      $set: {
        complete: true,
        solutionFile: solutionFileName,
        threadId: null
      }
    });

    await mongoose.disconnect();

    // Send email to workerData.createdByEmail that seating arrangement has been generated
    // sendQuizEmail(workerData.createdByEmail, workerData.title, solutionFileName, true);

    console.log(`Done with work in thread ${threadId}. Exiting...`);
  } catch (err) {
    // Connect to database
    await connectToDatabase(threadId);
    console.error(err)
    // Set fail to true
    await Quiz.findByIdAndUpdate(workerData._id, {
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