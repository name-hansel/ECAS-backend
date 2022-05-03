const { Worker, SHARE_ENV } = require("worker_threads");

const SeatingArrangement = require("../models/SeatingArrangement");
const WorkerThreads = require("./worker_threads_singleton");

module.exports = async function initializeGA() {
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
      _id: SA._id.toString(), studentFileName: SA.studentFile, courseFileName: SA.courseFile, roomFileName: SA.roomFile, lowerTitle
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

  console.log(`Done initializing. ${seatingArrangementData.length} worker threads.`)
}