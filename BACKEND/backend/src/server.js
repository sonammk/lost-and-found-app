const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, "../../../FRONTEND/frontend");
console.log("Frontend path:", frontendPath);

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Lost and Found API is running with MySQL" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

startServer();
