const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// @route   GET /api/public/document/:filename
// @desc    Get document
// @access  Public
router.get("/document/:filename", async (req, res) => {
  try {
    const fileName = req.params.filename;
    const result = await s3.getObject({
      Bucket: process.env.BUCKET_NAME,
      Key: fileName
    }).promise();
    res.status(200).send(result.Body);
  } catch (err) {
    // File does not exist
    if (err.code && err.code === 'NoSuchKey')
      return res.status(404).send('File not found');
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;