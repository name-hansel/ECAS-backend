const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require('multer');

const Notice = require("../../models/Notice");
const { idValidator, noticeValidator } = require("../../utils/validationMiddleware");
const { addEmailJobToQueue, cancelJob } = require("../../utils/sendMail")

const s3 = new AWS.S3();
const upload = multer();

// @route   POST /api/exam_cell/notice/document
// @desc    Upload an document to AWS S3 bucket
// @access  Private
router.post("/document", upload.single('file'), async (req, res) => {
  try {
    // Get extension of document
    const name = req.file.originalname.split(".");
    const ext = name.pop();
    const fileName = name.join(".");
    const key = `${fileName}_${new Date().toJSON()}.${ext}`
    await s3.putObject({
      Body: req.file.buffer,
      Bucket: process.env.BUCKET_NAME,
      Key: key
    }).promise();
    res.setHeader('Location', `${process.env.domain}/api/public/notice/${key}`);
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

// @route   DELETE /api/exam_cell/notice/document/:filename
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

// @route   DELETE /api/exam_cell/notice/document
// @desc    Delete multiple documents from AWS S3 bucket
// @access  Private
router.delete('/document', async (req, res) => {
  try {
    const { files } = req.body;

    // Delete files from AWS S3
    const Objects = [];
    files.forEach(file => {
      Objects.push({
        Key: file
      })
    });

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Delete: {
        Objects: Objects
      }
    }

    await s3.deleteObjects(params).promise();

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
    const noticeData = await Notice.findOne({ _id }).populate('branch').populate('addedBy', '_id firstName lastName');

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
    const noticeData = await Notice.find().sort({ createdAt: -1 }).populate('branch').populate('addedBy', '_id firstName lastName');
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
    const { title, description, files, branch, year, sendNotification, sendEmailIn } = req.body;

    // Create new notice instance
    const newNotice = new Notice({
      title, description, branch, year, attachments: files, addedBy: req.user_id, sendNotification
    })

    if (sendNotification) {
      newNotice.sendEmailIn = sendEmailIn;
      // Set visible to false as students can see only after sendEmailIn period is over
      newNotice.visible = false;
    }

    const noticeData = await newNotice.save();
    if (!sendNotification) return res.status(201).json(noticeData);

    // Add job to queue
    const jobId = await addEmailJobToQueue(noticeData._id, sendEmailIn);

    // Save job id in database
    // If notice is deleted before deletion period
    // Cancel job
    noticeData.jobId = jobId;
    await noticeData.save();

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
    const { title, description, files, branch, year } = req.body;
    const oldNoticeData = await Notice.findById(_id);
    if (!oldNoticeData) return res.status(404).json({
      error: 'Notice not found'
    });

    if (!oldNoticeData.sendNotification) {
      const newNotice = await Notice.findByIdAndUpdate(_id, {
        $set: {
          title, description, attachments: files, branch, year
        }
      }, { new: true })
      return res.status(200).json(newNotice);
    }

    // Check if visible
    // Visible means that the emails have been sent
    if (oldNoticeData.visible) return res.status(400).json({
      error: 'Cannot edit notice as emails have already been sent'
    })

    // Edit notice
    const newNotice = await Notice.findByIdAndUpdate(_id, {
      $set: {
        title, description, attachments: files, branch, year
      }
    }, { new: true });
    return res.status(200).json(newNotice);
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// Delete Notice by id
const deleteNoticeById = async (_id) => await Notice.findByIdAndDelete(_id);

// Delete notice attachments
const deleteNoticeAttachments = async (attachments) => {
  // Delete files from AWS S3
  const Objects = [];
  attachments.forEach(file => {
    Objects.push({
      Key: file
    })
  });

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Delete: {
      Objects: Objects
    }
  }

  await s3.deleteObjects(params).promise();
}

// @route   DELETE /api/exam_cell/notice/:_id
// @desc    Delete notice
// @access  Private
router.delete('/:_id', idValidator, async (req, res) => {
  try {
    const { _id } = req.params;

    const noticeData = await Notice.findById(_id);
    if (!noticeData) return res.status(404).json({ error: "Notice not found" });

    // No attachments and send email option not enabled
    if (!noticeData.sendNotification) {
      if (noticeData.attachments.length !== 0) await deleteNoticeAttachments(noticeData.attachments);
      await deleteNoticeById(_id);
      return res.status(204).end();
    }

    // Send email option was enabled
    // Check if period has passed
    const timeNow = Date.parse(new Date());
    const createdAt = Date.parse(noticeData.createdAt);
    const differenceInMinutes = (timeNow - createdAt) / (1000 * 60);
    if (differenceInMinutes > noticeData.sendEmailIn) {
      // Send email in period is over
      return res.status(400).json({
        error: "Cannot delete notice as emails have been sent."
      })
    }

    // Emails have not been send
    // Cancel email job
    await cancelJob(noticeData.jobId);
    if (noticeData.attachments.length !== 0) await deleteNoticeAttachments(noticeData.attachments);
    await deleteNoticeById(_id);
    res.status(204).end();
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router