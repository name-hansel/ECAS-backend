const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// @route   GET /api/public/:documentType/:filename
// @desc    Get document
// @access  Public
router.get("/:documentType/:filename", async (req, res) => {
  try {
    const fileName = req.params.filename;
    const documentType = req.params.filename;
    const bucket = documentType === "notice" ? process.env.BUCKET_NAME : process.env.SA_BUCKET_NAME;

    const result = await s3.getObject({
      Bucket: bucket,
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