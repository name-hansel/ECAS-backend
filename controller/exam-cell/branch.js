const express = require("express");
const router = express.Router();

const Branch = require("../../models/Branch")
const { branchValidator, idValidator } = require("../../utils/validationMiddleware")

// @route   GET /api/exam_cell/branch/:_id
// @desc    Get branch by id
// @access  Private
router.get("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const branchData = await Branch.findOne({ _id, archived: false })

    if (!branchData) return res.status(404).json({
      error: 'Branch not found'
    })

    res.status(200).json(branchData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   GET /api/exam_cell/branch
// @desc    Get all branches
// @access  Private
router.get("/", async (req, res) => {
  try {
    const branchData = await Branch.find();
    const sortedBranchData = {
      archived: [],
      active: []
    };
    for (let i = 0; i < branchData.length; i++) {
      branchData[i].archived ? sortedBranchData.archived.push(branchData[i]) : sortedBranchData.active.push(branchData[i])
    }
    res.status(200).json(sortedBranchData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

// @route   POST /api/exam_cell/branch
// @desc    Add new branch
// @access  Private
router.post("/", branchValidator, async (req, res) => {
  try {
    const { code, name } = req.body;
    const newBranch = new Branch({
      code, name
    })
    const branchData = await newBranch.save();
    res.status(201).json(branchData);
  } catch (err) {
    if (!err.code) {
      console.error(err.message);
      return res.status(500).json({
        error: "Server error",
      });
    }
    if (err.code === 11000) {
      res.status(400).json({
        error: [{
          param: Object.keys(err.keyPattern)[0],
          msg: `A branch with this data already exists`
        }]
      })
    }
  }
})

// @route   PUT /api/exam_cell/branch/:_id
// @desc    Edit branch
// @access  Private
router.put("/:_id", idValidator, branchValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    // Find branch by id and update
    const updatedBranch = await Branch.findByIdAndUpdate(_id, {
      code: req.body.code,
      name: req.body.name
    }, { new: true })
    if (!updatedBranch) return res.status(404).json({
      error: "Branch not found"
    })
    res.status(200).json(updatedBranch)
  } catch (err) {
    if (!err.code) {
      console.error(err.message);
      return res.status(500).json({
        error: "Server error",
      });
    }
    if (err.code === 11000) {
      res.status(400).json({
        error: [{
          param: Object.keys(err.keyPattern)[0],
          msg: `A branch with this data already exists`
        }]
      })
    }
  }
})

// @route   PATCH /api/exam_cell/branch/:_id
// @desc    Archive/unarchive branch
// @access  Private
router.patch("/:_id", idValidator, async (req, res) => {
  try {
    const { _id } = req.params;
    const branchData = await Branch.findById(_id)
    if (!branchData) return res.status(404).json({
      error: "Branch not found"
    })

    branchData.archived = !branchData.archived;
    await branchData.save();
    res.status(200).json(branchData)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server error",
    });
  }
})

module.exports = router