const express = require("express");
const router = express.Router();

// Model will be trained for delete topic and qna routes

const FAQ = require("../../models/FAQ");
const { idValidator, faqValidator } = require("../../utils/validationMiddleware");

// QnA
// const tf = require('@tensorflow/tfjs-node');
// const qna = require('@tensorflow-models/qna');

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

    // Push qna to topic
    topicData.questionAndAnswers.push({
      question, answer
    })
    await topicData.save();
    res.status(200).json(topicData);
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

    res.status(204).end()
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router;