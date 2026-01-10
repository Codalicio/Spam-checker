const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

const getSpamCount = async (phone) => {
  return prisma.spamReport.count({
    where: { phone },
  });
};

router.get("/name", authMiddleware, async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ message: "Query name is required!" });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
    });

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
    });

    let results = [];

    for (const contact of contacts) {
      results.push({
        name: contact.name,
        phone: contact.phone,
        type: "contact",
      });
    }

    for (const user of users) {
      results.push({
        name: user.name,
        phone: user.phone,
        type: "user",
      });
    }

    for (let result of results) {
      result.spamCount = await getSpamCount(result.phone);
    }

    const startsWith = [];
    const contains = [];

    for (const result of results) {
      if (result.name.toLowerCase().startsWith(query.toLowerCase())) {
        startsWith.push(result);
      } else {
        contains.push(result);
      }
    }

    const sortedResults = [...startsWith, ...contains];

    return res.json(sortedResults);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

module.exports = router;
