const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// Create contact :
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.userId;

    if (!name || !phone) {
      return res.status(400).json({ message: "name and phone are required!" });
    }

    const existingContact = await prisma.contact.findFirst({
      where: {
        ownerId: userId,
        phone: phone,
      },
    });

    if (existingContact) {
      return res.status(400).json({
        message: "You already have this number in your contacts",
      });
    }

    const contact = await prisma.contact.create({
      data: { name, phone, ownerId: userId },
    });
    return res.status(201).json({
      success: true,
      message: "Contact added successfully",
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get all contacts :
router.get("/", authMiddleware, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        ownerId: req.user.userId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({
      success: true,
      count: contacts.length,
      contacts: contacts,
    });
  } catch (err) {
    return res.json({ message: "An error occurred while fetching contacts" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const contactId = Number(req.params.id);

    if (isNaN(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        ownerId: req.user.userId,
      },
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found or you don't have permission to delete it",
      });
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while deleting contact",
    });
  }
});

module.exports = router;
