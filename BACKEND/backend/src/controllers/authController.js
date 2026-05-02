const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/db");

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone
});

const isValidPhone = (phone) => {
  return /^[0-9]{10}$/.test(phone);
};

const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cleanPhone = phone.trim();

    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db
      .prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)")
      .run(name.trim(), cleanEmail, hashedPassword, cleanPhone);

    const user = db
      .prepare("SELECT id, name, email, phone FROM users WHERE id = ?")
      .get(Number(result.lastInsertRowid));

    const token = createToken(user.id);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = {
  signup,
  login
};
