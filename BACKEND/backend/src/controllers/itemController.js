const Item = require("../models/Item");

const createItem = async (req, res) => {
  try {
    const { title, description, category, location, status, date } = req.body;

    if (!title || !description || !category || !location || !status || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const itemDate = new Date(date);

    if (Number.isNaN(itemDate.getTime())) {
      return res.status(400).json({ message: "Please enter a valid date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate > today) {
      return res.status(400).json({ message: "Date cannot be in the future" });
    }

    const item = await Item.create({
      title,
      description,
      category,
      location,
      status,
      date: itemDate,
      postedBy: req.user._id
    });

    res.status(201).json({
      message: "Item posted successfully",
      item
    });
  } catch (error) {
    res.status(500).json({ message: "Item creation failed", error: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const { search, status, category, resolved } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (resolved === "true") {
      filter.isResolved = true;
    }

    if (resolved === "false") {
      filter.isResolved = false;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    const items = await Item.find(filter)
      .populate("postedBy", "name email phone")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch items", error: error.message });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id })
      .populate("postedBy", "name email phone")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch your items", error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can delete only your own posts" });
    }

    await item.deleteOne();

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete item", error: error.message });
  }
};

const toggleResolved = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can update only your own posts" });
    }

    item.isResolved = !item.isResolved;
    await item.save();

    const updatedItem = await Item.findById(item._id).populate("postedBy", "name email phone");

    res.json({
      message: item.isResolved ? "Item marked as resolved" : "Item marked as active",
      item: updatedItem
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
