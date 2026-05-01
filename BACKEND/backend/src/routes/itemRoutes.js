const express = require("express");
const {
  createItem,
  deleteItem,
  getItems,
  getMyItems,
  toggleResolved
} = require("../controllers/itemController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, getMyItems);
router.get("/", getItems);
router.post("/", protect, createItem);
router.patch("/:id/resolve", protect, toggleResolved);
router.delete("/:id", protect, deleteItem);

module.exports = router;
