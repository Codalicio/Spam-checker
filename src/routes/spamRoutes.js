const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required!" });
    }

    const alreadyReported = await prisma.spamReport.findFirst({
      where: {
        phone,
        reportedBy: req.user.userId,
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
        reportedBy: req.user.userId,
      },
    });

    res.status(201).json({ message: "Number marked as spam" });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

module.exports = router;
