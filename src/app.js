const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.js");
const testRoutes = require("./routes/testRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use("/contacts", contactRoutes);

module.exports = app;
