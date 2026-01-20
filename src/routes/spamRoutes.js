const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const { calculateSpamLikelihood } = require("../utils/utils.js");
const { markNumberAsSpam } = require("../controllers/spam/spamController.js");

const router = express.Router();

// Mark a number as spam :
router.post("/", authMiddleware, markNumberAsSpam);

// Remove Spam Report From a Number :
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    const spamReport = await prisma.spamReport.findFirst({
      where: {
        phone,
        reportedBy: userId,
      },
    });

    if (!spamReport) {
      return res
        .status(404)
        .json({ message: "You haven't marked this number as spam" });
    }

    await prisma.spamReport.delete({
      where: {
        id: spamReport.id,
      },
    });

    return res.json({
      success: true,
      message: "Spam report removed",
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while removing spam report",
    });
  }
});

// Get Spam Report counts and spam-likelihood for a number :
router.get("/:phone", authMiddleware, async (req, res) => {
  try {
    const phone = req.params.phone;

    const reportCount = await prisma.spamReport.count({
      where: { phone },
    });

    const spamLikelihood = calculateSpamLikelihood(reportCount);

    return res.json({
      success: true,
      phone: phone,
      reportCount: reportCount,
      spamLikelihood: spamLikelihood,
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while fetching spam information",
    });
  }
});

module.exports = router;
