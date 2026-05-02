const { db } = require("../config/db");

const formatItem = (row) => ({
  _id: row.id,
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  location: row.location,
  status: row.status,
  date: row.date,
  isResolved: Boolean(row.is_resolved),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  postedBy: {
    _id: row.user_id,
    id: row.user_id,
    name: row.user_name,
    email: row.user_email,
    phone: row.user_phone
  }
});

const itemSelect = `
SELECT
  items.*,
  users.id AS user_id,
  users.name AS user_name,
  users.email AS user_email,
  users.phone AS user_phone
FROM items
JOIN users ON users.id = items.posted_by
`;

const createItem = async (req, res) => {
  try {
    const { title, description, category, location, status, date } = req.body;

    if (!title || !description || !category || !location || !status || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["lost", "found"].includes(status)) {
      return res.status(400).json({ message: "Status must be lost or found" });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      return res.status(400).json({ message: "Please enter a valid date" });
    }

    const today = new Date().toLocaleDateString("en-CA");

    if (date > today) {
      return res.status(400).json({ message: "Date cannot be in the future" });
    }

    const result = db
      .prepare(`
        INSERT INTO items (title, description, category, location, status, date, posted_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        title.trim(),
        description.trim(),
        category.trim(),
        location.trim(),
        status,
        date,
        req.user.id
      );

    const row = db
      .prepare(`${itemSelect} WHERE items.id = ?`)
      .get(Number(result.lastInsertRowid));

    res.status(201).json({
      message: "Item posted successfully",
      item: formatItem(row)
    });
  } catch (error) {
    res.status(500).json({ message: "Item creation failed", error: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const { search, status, category, resolved } = req.query;
    const conditions = [];
    const values = [];

    if (status) {
      conditions.push("items.status = ?");
      values.push(status);
    }

    if (category) {
      conditions.push("LOWER(items.category) = LOWER(?)");
      values.push(category);
    }

    if (resolved === "true") {
      conditions.push("items.is_resolved = 1");
    }

    if (resolved === "false") {
      conditions.push("items.is_resolved = 0");
    }

    if (search) {
      conditions.push("(items.title LIKE ? OR items.description LIKE ? OR items.location LIKE ?)");
      const searchValue = `%${search}%`;
      values.push(searchValue, searchValue, searchValue);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = db
      .prepare(`${itemSelect} ${whereClause} ORDER BY items.created_at DESC`)
      .all(...values);

    res.json(rows.map(formatItem));
  } catch (error) {
    res.status(500).json({ message: "Could not fetch items", error: error.message });
  }
};

const getMyItems = async (req, res) => {
  try {
    const rows = db
      .prepare(`${itemSelect} WHERE items.posted_by = ? ORDER BY items.created_at DESC`)
      .all(req.user.id);

    res.json(rows.map(formatItem));
  } catch (error) {
    res.status(500).json({ message: "Could not fetch your items", error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.posted_by !== req.user.id) {
      return res.status(403).json({ message: "You can delete only your own posts" });
    }

    db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete item", error: error.message });
  }
};

const toggleResolved = async (req, res) => {
  try {
    const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.posted_by !== req.user.id) {
      return res.status(403).json({ message: "You can update only your own posts" });
    }

    const nextResolved = item.is_resolved ? 0 : 1;
    db
      .prepare("UPDATE items SET is_resolved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(nextResolved, req.params.id);

    const row = db.prepare(`${itemSelect} WHERE items.id = ?`).get(req.params.id);

    res.json({
      message: nextResolved ? "Item marked as resolved" : "Item marked as active",
      item: formatItem(row)
    });
  } catch (error) {
    res.status(500).json({ message: "Could not update item", error: error.message });
  }
};

module.exports = {
  createItem,
  getItems,
  getMyItems,
  deleteItem,
  toggleResolved
};
