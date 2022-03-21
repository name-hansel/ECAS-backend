const express = require("express");
const router = express.Router();

// Model will be trained for delete topic and qna routes

const FAQ = require("../../models/FAQ");
const { idValidator, faqValidator } = require("../../utils/validationMiddleware");

// QnA
// const tf = require('@tensorflow/tfjs-node');
// const qna = require('@tensorflow-models/qna');
// const model = qna.load();

// @route   GET /api/exam_cell/faq/answer
// @desc    Find answer
// @access  Private
// router.get("/answer", async (req, res) => {
//   try {
//     const { question } = req.body;
//     if (!question || question.length === 0) return res.status(400).json({
//       error: 'Invalid question'
//     })

//     // Get passage from all FAQs
//     const passage = `Nikola Tesla (/ˈtɛslə/;[2] Serbo-Croatian: [nǐkola têsla]; Serbian Cyrillic: Никола Тесла;[a] 10
//       July 1856 – 7 January 1943) was a Serbian-American[4][5][6] inventor, electrical engineer, mechanical engineer,
//       and futurist who is best known for his contributions to the design of the modern alternating current (AC)
//       electricity supply system.[7] <br>

//       Born and raised in the Austrian Empire, Tesla studied engineering and physics in the 1870s without receiving a
//       degree, and gained practical experience in the early 1880s working in telephony and at Continental Edison in the
//       new electric power industry. He emigrated in 1884 to the United States, where he would become a naturalized
//       citizen. He worked for a short time at the Edison Machine Works in New York City before he struck out on his own.
//       With the help of partners to finance and market his ideas, Tesla set up laboratories and companies in New York to
//       develop a range of electrical and mechanical devices. His alternating current (AC) induction motor and related
//       polyphase AC patents, licensed by Westinghouse Electric in 1888, earned him a considerable amount of money and
//       became the cornerstone of the polyphase system which that company would eventually market.<br>

//       Attempting to develop inventions he could patent and market, Tesla conducted a range of experiments with
//       mechanical oscillators/generators, electrical discharge tubes, and early X-ray imaging. He also built a
//       wireless-controlled boat, one of the first ever exhibited. Tesla became well known as an inventor and would
//       demonstrate his achievements to celebrities and wealthy patrons at his lab, and was noted for his showmanship at
//       public lectures. Throughout the 1890s, Tesla pursued his ideas for wireless lighting and worldwide wireless
//       electric power distribution in his high-voltage, high-frequency power experiments in New York and Colorado
//       Springs. In 1893, he made pronouncements on the possibility of wireless communication with his devices. Tesla
//       tried to put these ideas to practical use in his unfinished Wardenclyffe Tower project, an intercontinental
//       wireless communication and power transmitter, but ran out of funding before he could complete it.[8]<br>

//       After Wardenclyffe, Tesla experimented with a series of inventions in the 1910s and 1920s with varying degrees of
//       success. Having spent most of his money, Tesla lived in a series of New York hotels, leaving behind unpaid bills.
//       He died in New York City in January 1943.[9] Tesla's work fell into relative obscurity following his death, until
//       1960, when the General Conference on Weights and Measures named the SI unit of magnetic flux density the tesla in
//       his honor.[10] There has been a resurgence in popular interest in Tesla since the 1990s.[11]`

//     const answers = await model.findAnswers(question, passage);
//     res.status(200).json(answers)
//   } catch (err) {
//     console.error(err.message);
//     return res.status(500).json({
//       error: "Server error",
//     });
//   }
// })

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

// TODO
// @route   PUT /api/exam_cell/faq/:_id
// @desc    Edit FAQ of a topic
// @access  Private

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