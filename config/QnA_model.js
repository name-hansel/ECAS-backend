const tf = require('@tensorflow/tfjs-node');
const qna = require('@tensorflow-models/qna');

const initializeModel = async () => {
  try {
    console.log("Loading model...");
    global.model = await qna.load();
    console.log("Loaded model.");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { initializeModel }