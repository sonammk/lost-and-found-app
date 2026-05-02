const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, "../../lost_found.sqlite");
const db = new DatabaseSync(dbPath);

const connectDB = () => {
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('lost', 'found')),
  date TEXT NOT NULL,
  is_resolved INTEGER DEFAULT 0,
  posted_by INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);
  `);

  console.log("SQLite database connected");
};

module.exports = {
  connectDB,
  db
};
