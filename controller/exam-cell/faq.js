const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")

const FAQ = require("../../models/FAQ");
const { idValidator, faqValidator } = require("../../utils/validationMiddleware");
// const { addPassageJobToQueue } = require("../../utils/changePassage")

// FAQ routes

// @route   POST /api/exam_cell/faq/:_id
// @desc    Add FAQ to topic
// @access  Private
router.post("/:_id", faqValidator, async (req, res) => {
  try {
    const topicId = req.params._id;
    const topicData = await FAQ.findById(topicId);
    const { question, answer } = req.body;
    if (!topicData) return res.status(400).json({
      error: 'Topic not found'
    })

    const faqId = mongoose.Types.ObjectId()
    // Push qna to topic
    topicData.questionAndAnswers.push({
      _id: faqId, question, answer
    })
    await topicData.save();

    // await addPassageJobToQueue({
    //   op: 'add', _id: [faqId], answer
    // });
    res.status(200).json({
      _id: faqId, question, answer
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/exam_cell/faq/:_id/:faq_id
// @desc    Delete FAQ from topic
// @access  Private
router.delete("/:_id/:faq_id", idValidator, async (req, res) => {
  try {
    const { _id, faq_id } = req.params;
    const updatedTopicData = await FAQ.findByIdAndUpdate(_id, {
      $pull: {
        questionAndAnswers: {
          _id: faq_id
        }
      }
    }, { new: true });

    if (!updatedTopicData) return res.status(400).json({
      error: 'FAQ not found'
    })

    // await addPassageJobToQueue({
    //   op: 'remove', _id: [faq_id]
    // });

    res.status(200).json(updatedTopicData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// FAQ topic routes

// @route   GET /api/exam_cell/faq
// @desc    Get one FAQs
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const FAQData = await FAQ.findById(req.params._id);
    if (!FAQData) return res.status(404).json({
      error: 'FAQ topic not found'
    })

    res.status(200).json(FAQData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/faq
// @desc    Get all FAQs
// @access  Private
router.get("/", async (req, res) => {
  try {
    const FAQData = await FAQ.find();
    res.status(200).json(FAQData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/faq
// @desc    Add topic
// @access  Private
router.post("/", async (req, res) => {
  try {
    const topic = req.body.topic;
    if (!topic || topic.length === 0) return res.status(400).json({
      error: 'Invalid topic name'
    })

    const newTopic = new FAQ({
      topic
    })
    await newTopic.save();
    res.status(200).json(newTopic);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   PUT /api/exam_cell/faq/:_id
// @desc    Edit topic
// @access  Private
router.put("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const topic = req.body.topic;

    if (!topic || topic.length === 0) return res.status(400).json({
      error: 'Invalid topic name'
    })

    const updatedTopicData = await FAQ.findByIdAndUpdate(_id, {
      topic
    }, { new: true })

    if (!updatedTopicData) return res.status(400).json({
      error: 'FAQ topic not found'
    })
    res.status(200).json(updatedTopicData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   DELETE /api/exam_cell/faq/:_id
// @desc    Delete topic
// @access  Private
router.delete("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;

    const FAQData = await FAQ.findByIdAndDelete(_id);
    if (!FAQData) return res.status(404).json({ error: "FAQ topic not found" })

    const idArray = FAQData.questionAndAnswers.map((qa) => qa._id);

    // await addPassageJobToQueue({
    //   op: 'remove', _id: idArray
    // });

    res.status(204).end()
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;