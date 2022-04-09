const Bull = require('bull');

const FAQ = require("../models/FAQ");
const Setting = require("../models/Setting");

const changePassageQueue = new Bull('faq-passage-queue');
const passage = {}

const convertToStringAndUpdateInDatabase = async () => {
  try {
    let answerString = "";
    // Get string from passage object
    for (key of Object.keys(passage))
      answerString += `${passage[key]} `;

    // Update answerString in database
    await Setting.findOneAndUpdate({ key: 'answerString' }, { $set: { value: answerString } }, { upsert: true });
    return;
  } catch (err) {
    console.error(err.message);
  }
}

const getPassage = async () => {
  try {
    // Populate passage arrays
    const FAQData = await FAQ.find();
    for (topic of FAQData) {
      for (qa of topic.questionAndAnswers) {
        passage[qa._id] = qa.answer;
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}

const addToPassage = async (_id, text) => {
  try {
    console.log("Adding to passage...");
    for (id of _id)
      passage[id] = text;

    await convertToStringAndUpdateInDatabase();
  } catch (err) {
    console.error(err.message);
  }
}

const removeFromPassage = async (_id) => {
  try {
    console.log("Removing from passage...");
    for (id of _id)
      delete passage[id];

    await convertToStringAndUpdateInDatabase();
  } catch (err) {
    console.error(err.message);
  }
}

changePassageQueue.process(async (job, done) => {
  if (job.data.op === 'add') await addToPassage(job.data._id, job.data.answer);
  else if (job.data.op === 'remove') await removeFromPassage(job.data._id);
  done();
});

const addPassageJobToQueue = async (data) => {
  await changePassageQueue.add(data);
  return;
}

module.exports = { addPassageJobToQueue, getPassage }