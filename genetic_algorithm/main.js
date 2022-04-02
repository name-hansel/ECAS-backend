const { workerData, threadId } = require("worker_threads")

const geneticAlgorithm = () => {
  console.log(`In thread ${threadId}`);
  console.log(workerData);
  setTimeout(() => {
    console.log('hehe')
  }, 1000 * 10)
}

geneticAlgorithm();