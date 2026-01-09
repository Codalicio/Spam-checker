const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "name and phone are required!" });
  }

  try {
    const contact = await prisma.contact.create({
      data: { name, phone, ownerId: req.user.userId },
    });
    return res.status(201).json(contact);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        ownerId: req.user.userId,
      },
    });
    return res.json(contacts);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

module.exports = router;
