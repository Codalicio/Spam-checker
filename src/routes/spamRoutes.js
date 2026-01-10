const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required!" });
    }

    const alreadyReported = await prisma.spamReport.findFirst({
      where: {
        phone,
        reportedBy: userId,
      },
    });

    if (alreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already marked this number as spam" });
    }

    await prisma.spamReport.create({
      data: {
        phone,
        reportedBy: userId,
      },
    });

    const totalReports = await prisma.spamReport.count({
      where: { phone },
    });

    res.status(201).json({
      success: true,
      message: "Number marked as spam",
      totalReports: totalReports,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "An error occurred while reporting spam" });
  }
});

module.exports = router;
