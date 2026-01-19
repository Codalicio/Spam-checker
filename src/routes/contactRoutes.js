const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const {
  createContact,
  getContacts,
  deleteContact,
  updateContact,
} = require("../controllers/contact/contactController.js");

const router = express.Router();

// Create contact :
router.post("/", authMiddleware, createContact);

// Get all contacts :
router.get("/", authMiddleware, getContacts);

// Delete a contact :
router.delete("/:id", authMiddleware, deleteContact);

// Update a contact :
router.put("/:id", authMiddleware, updateContact);

module.exports = router;
