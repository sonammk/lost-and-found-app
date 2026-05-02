// SQL version: users are stored in the `users` table created in config/db.js.
// This file is kept so the project structure remains easy to understand.

const userTable = {
  tableName: "users",
  columns: ["id", "name", "email", "password", "phone", "created_at", "updated_at"]
};

module.exports = userTable;
