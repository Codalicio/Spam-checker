const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const {
  markNumberAsSpam,
  removeNumberAsSpam,
  findSpamLikelihood,
} = require("../controllers/spam/spamController.js");

const router = express.Router();

// Mark a number as spam :
router.post("/", authMiddleware, markNumberAsSpam);

// Remove Spam Report From a Number :
router.delete("/", authMiddleware, removeNumberAsSpam);

// Get Spam Report count and spam-likelihood for a number :
router.get("/:phone", authMiddleware, findSpamLikelihood);

module.exports = router;
