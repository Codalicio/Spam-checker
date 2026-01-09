const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma/client.js");

const router = express.Router();

// user register API :
router.post("/register", async (req, res) => {
  try {
    const { name, phone, password, email } = req.body;

    if (!name || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, phone and password are required!" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered!" });
    }

    const hashedPassword = bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, phone, email, password: hashedPassword },
    });

    res.status(200).json({ message: "User registered successfully." });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

// user login API :
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // fetch user by phone :
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(400).json({ message: "User not registered!" });
    }
  } catch (err) {
    return res.json({ message: err.message });
  }
});
