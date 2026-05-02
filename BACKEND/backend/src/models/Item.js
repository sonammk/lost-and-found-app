// SQL version: items are stored in the `items` table created in config/db.js.
// Each item has a foreign key `posted_by` that points to users.id.

const itemTable = {
  tableName: "items",
  columns: [
    "id",
    "title",
    "description",
    "category",
    "location",
    "status",
    "date",
    "is_resolved",
    "posted_by",
    "created_at",
    "updated_at"
  ]
};

module.exports = itemTable;
