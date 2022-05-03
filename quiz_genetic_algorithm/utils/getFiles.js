const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const getFiles = async (questionsFileName) => {
  const questionsFile = await s3.getObject({
    Bucket: process.env.QUIZ_BUCKET_NAME,
    Key: questionsFileName
  }).promise();
  return questionsFile.Body;
}

module.exports = getFiles;