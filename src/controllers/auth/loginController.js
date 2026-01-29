const prisma = require("../../client.js");
const { comparePassword } = require("../../utils/hash.js");
const { generateToken } = require("../../utils/jwt.js");

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Phone number and password are required" });
    }

    // find user by phone :
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    // Generic error message to prevent user enumeration
    // Don't tell attackers if phone exists or password is wrong
    const invalidMessage = "Invalid phone number or password";

    if (!user) {
      return res.status(400).json({ message: invalidMessage });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: invalidMessage });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
