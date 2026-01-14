const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../client.js");
const { signUp } = require("../controllers/auth/signUpController.js");
const { login } = require("../controllers/auth/loginController.js");

const router = express.Router();

// register route :
router.post("/register", signUp);

// user login route :
router.post("/login", login);

module.exports = router;
