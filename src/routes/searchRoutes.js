const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const { calculateSpamLikelihood } = require("../utils/utils.js");

const router = express.Router();

router.get("/name", authMiddleware, async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    if (query.length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        phone: true,
      },
    });

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    const allPhones = [
      ...users.map((u) => u.phone),
      ...contacts.map((c) => c.phone),
    ];

    const uniquePhones = [...new Set(allPhones)];

    const spamCounts = await prisma.spamReport.groupBy({
      by: ["phone"],
      where: {
        phone: {
          in: uniquePhones,
        },
      },
      _count: {
        phone: true,
      },
    });

    const spamCountMap = {};
    spamCounts.forEach((item) => {
      spamCountMap[item.phone] = item._count.phone;
    });

    let results = [];

    users.forEach((user) => {
      results.push({
        name: user.name,
        phone: user.phone,
        email: user.email,
        type: "user",
        userId: user.id,
        spamLikelihood: calculateSpamLikelihood(spamCountMap[user.phone] || 0),
      });
    });

    contacts.forEach((contact) => {
      results.push({
        name: contact.name,
        phone: contact.phone,
        type: "contact",
        spamLikelihood: calculateSpamLikelihood(
          spamCountMap[contact.phone] || 0
        ),
      });
    });

    const startsWith = [];
    const contains = [];

    results.forEach((result) => {
      if (result.name.toLowerCase().startsWith(query.toLowerCase())) {
        startsWith.push(result);
      } else {
        contains.push(result);
      }
    });

    const sortedResults = [...startsWith, ...contains];

    return res.json({
      success: true,
      query: query,
      count: sortedResults.length,
      results: sortedResults,
    });
  } catch (err) {
    return res.status(500).json({ message: "An error occurred during search" });
  }
});

module.exports = router;
