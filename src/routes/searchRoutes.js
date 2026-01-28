const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const {
  searchByName,
  searchByPhone,
} = require("../controllers/search/searchController.js");

const router = express.Router();

router.get("/name", authMiddleware, searchByName);
router.get("/phone", authMiddleware, searchByPhone);

module.exports = router;
