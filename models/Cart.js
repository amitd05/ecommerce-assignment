const mongoose = require("mongoose");
const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    { itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, quantity: Number }
  ]
});

module.exports = mongoose.model("Cart", CartSchema);