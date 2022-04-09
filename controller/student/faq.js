const express = require("express");
const router = express.Router();

// const Setting = require("../../models/Setting")
const FAQ = require("../../models/FAQ")

// @route   GET /api/student/faq
// @desc    Get all FAQs
// @access  Private
router.get("/", async (req, res) => {
  try {
    const FAQData = await FAQ.find();
    return res.status(200).json(FAQData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// router.get('/', async (req, res) => {
//   try {
//     // Get passage
//     const { value } = await Setting.findOne({ key: 'answerString' });
//     const question = req.body.question;
//     const answers = await global.model.findAnswers(question, passage);

//     res.status(200).json(answers)
//   } catch (err) {
//     console.error(err.message);
//     return res.status(500).json({
//       error: "Server error",
//     });
//   }
// })

module.exports = router