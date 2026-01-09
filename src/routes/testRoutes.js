const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

module.exports = router;
