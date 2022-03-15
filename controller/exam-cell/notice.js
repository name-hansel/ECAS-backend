const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require('multer');

const Notice = require("../../models/Notice")
const { idValidator, noticeValidator } = require("../../utils/validationMiddleware");

const s3 = new AWS.S3();
const upload = multer();
router.use(upload.array());

// @route   POST /api/exam_cell/notice/document
// @desc    Upload an document to AWS S3 bucket
// @access  Private
router.post("/document", upload.single('file'), async (req, res) => {
  try {
    const [fileName, ext] = req.file.originalname.split(".");
    const key = `${fileName}_${new Date().toJSON()}.${ext}`
    const result = await s3.putObject({
      Body: req.file.buffer,
      Bucket: process.env.BUCKET_NAME,
      Key: key
    }).promise();
    res.setHeader('Location', `${process.env.domain}/api/public/document/${key}`);
    res.status(201).json({
      fileName: key
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/exam_cell/notice/document
// @desc    Delete an document from AWS S3 bucket
// @access  Private
router.delete('/document/:filename', async (req, res) => {
  try {
    const fileName = req.params.filename;
    const result = await s3.deleteObject({
      Bucket: process.env.BUCKET_NAME,
      Key: fileName
    }).promise();
    res.status(204).end();
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/notice/:_id
// @desc    Get notice by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const noticeData = await Notice.findOne({ _id }).populate('branch')

    if (!noticeData) return res.status(404).json({
      error: 'Notice not found'
    })

    res.status(200).json(noticeData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/notice
// @desc    Get all notices
// @access  Private
router.get("/", async (req, res) => {
  try {
    const noticeData = await Notice.find().populate('branch');
    res.status(200).json(noticeData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/notice
// @desc    Add new notice
// @access  Private
router.post("/", noticeValidator, async (req, res) => {
  try {
    // TODO send email notifications
    const { title, description } = req.body;

    // Parse received arrays
    const files = JSON.parse(req.body.files);
    const branch = JSON.parse(req.body.branch);
    const semester = JSON.parse(req.body.semester);

    // Create new notice instance
    const newNotice = new Notice({
      title, description, branch, semester, attachments: files
    })

    const noticeData = await newNotice.save();
    await noticeData.populate('branch');
    res.status(201).json(noticeData);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PUT /api/exam_cell/notice/:_id
// @desc    Edit notice
// @access  Private
router.put('/:_id', idValidator, noticeValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const { title, description } = req.body;

    // Parse received arrays
    const files = JSON.parse(req.body.files);
    const branch = JSON.parse(req.body.branch);
    const semester = JSON.parse(req.body.semester);

    const updatedNotice = await Notice.findByIdAndUpdate(_id, {
      title, description, branch, semester, attachments: files
    }, { new: true }).populate('branch')

    if (!updatedNotice) return res.status(404).json({
      error: "Notice not found"
    })
    res.status(200).json(updatedNotice)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/exam_cell/notice/:_id
// @desc    Delete notice
// @access  Private
router.delete('/:_id', idValidator, async (req, res) => {
  try {
    // TODO delete attachments
    const { _id } = req.params;

    const noticeData = await Notice.findByIdAndDelete(_id);
    if (!noticeData) return res.status(404).json({ error: "Notice not found" })

    res.status(204).end()
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router