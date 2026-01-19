const express = require("express");
const prisma = require("../client.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const {
  createContact,
  getContacts,
  deleteContact,
} = require("../controllers/contact/contactController.js");

const router = express.Router();

// Create contact :
router.post("/", authMiddleware, createContact);

// Get all contacts :
router.get("/", authMiddleware, getContacts);

// Delete a contact :
router.delete("/:id", authMiddleware, deleteContact);

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const contactId = Number(req.params.id);

    const { name, phone } = req.body;

    if (isNaN(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        ownerId: req.user.userId,
      },
    });

    if (!existingContact) {
      return res.status(404).json({
        message: "Contact not found or you don't have permission to update it",
      });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { name, phone },
    });

    return res.json({
      success: true,
      message: "Contact updated successfully",
      contact: {
        id: updatedContact.id,
        name: updatedContact.name,
        phone: updatedContact.phone,
        createdAt: updatedContact.createdAt,
        updatedAt: updatedContact.updatedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while updating contact",
    });
  }
});

module.exports = router;
