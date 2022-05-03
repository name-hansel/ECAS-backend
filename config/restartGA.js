const { Worker, SHARE_ENV } = require("worker_threads");

const SeatingArrangement = require("../models/SeatingArrangement");
const Quiz = require("../models/Quiz");
const WorkerThreads = require("./worker_threads_singleton");

const initializeQuizGA = async () => {
  const { active_worker_threads } = WorkerThreads.getInstance();
  const quizData = await Quiz.find({
    complete: false,
    failed: false
  }).populate('faculty').populate('course');

  for (const quiz of quizData) {
    if (!quiz.questionsFile) {
      console.log(`Skipping ${quiz.title}`);
      continue;
    }

    const lowerTitle = encodeURI(quiz.title.toLowerCase());
    const workerData = {
      _id: quiz._id.toString(), questionsFileName: quiz.questionsFile, createdByEmail: quiz.faculty.email, title: quiz.title, lowerTitle,
      rows: quiz.rows, columns: quiz.columns, numberOfStudents: quiz.numberOfStudents, numberOfQuestionsInQuiz: quiz.numberOfQuestionsInQuiz
    }

    // Create thread
    const thread = new Worker("./quiz_genetic_algorithm/main.js", {
      workerData, env: SHARE_ENV
    })

    // Add thread to array
    active_worker_threads.push(thread);

    // Add threadId to SA instance
    quiz.threadId = thread.threadId;
    await quiz.save();
  }

  console.log(`Done initializing. ${quizData.length} worker threads for quiz.`)
}

async function initializeGA() {
  const { active_worker_threads } = WorkerThreads.getInstance();
  const seatingArrangementData = await SeatingArrangement.find({
    complete: false,
    failed: false
  })

  for (const SA of seatingArrangementData) {
    if (!SA.studentFile || !SA.courseFile || !SA.roomFile) {
      console.log(`Skipping ${SA.title}`);
      continue;
    }

    const lowerTitle = encodeURI(SA.title.toLowerCase());

    const workerData = {
      _id: SA._id.toString(), studentFileName: SA.studentFile, courseFileName: SA.courseFile, roomFileName: SA.roomFile, lowerTitle,
      title: SA.title, createdByEmail: SA.createdByEmail
    }

    // Create thread
    const thread = new Worker("./seating_genetic_algorithm/main.js", {
      workerData, env: SHARE_ENV
    })

    // Add thread to array
    active_worker_threads.push(thread);

    // Add threadId to SA instance
    SA.threadId = thread.threadId;
    await SA.save();
  }

  console.log(`Done initializing. ${seatingArrangementData.length} worker threads for seat arrangement.`)
}

module.exports = {
  initializeGA,
  initializeQuizGA
}