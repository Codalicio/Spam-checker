const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const { searchByName } = require("../controllers/search/searchController.js");

const router = express.Router();

router.get("/name", authMiddleware, searchByName);

module.exports = router;
