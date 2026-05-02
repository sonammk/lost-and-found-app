const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");

dotenv.config();
connectDB();

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
  res.json({ message: "Lost and Found API is running with SQLite" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
