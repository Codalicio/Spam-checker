const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  try {
    return res.json({
      message: "You are authenticated",
      user: req.user,
    });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

module.exports = router;
