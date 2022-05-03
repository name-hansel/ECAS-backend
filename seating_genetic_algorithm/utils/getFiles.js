const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const getFiles = async (studentFileName, courseFileName, roomFileName) => {
  const studentFile = await s3.getObject({
    Bucket: process.env.SA_BUCKET_NAME,
    Key: studentFileName
  }).promise();

  const courseFile = await s3.getObject({
    Bucket: process.env.SA_BUCKET_NAME,
    Key: courseFileName
  }).promise();

  const roomFile = await s3.getObject({
    Bucket: process.env.SA_BUCKET_NAME,
    Key: roomFileName
  }).promise();

  return {
    studentFile: studentFile.Body,
    courseFile: courseFile.Body,
    roomFile: roomFile.Body
  }
}

module.exports = getFiles;