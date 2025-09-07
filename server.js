const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connect ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log("Mongo Connected"))
  .catch(err => console.error(err));

const User = require("./models/User");
const Item = require("./models/Item");
const Cart = require("./models/Cart");

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user._id, email: user.email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ msg: "No user" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ msg: "Bad credentials" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user._id, email: user.email } });
});

// --- Middleware to protect routes ---
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "Missing token" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// --- Item CRUD ---
app.get("/api/items", async (req, res) => {
  const { category, minPrice, maxPrice, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: "i" };
  if (minPrice || maxPrice) filter.price = {
    ...(minPrice && { $gte: Number(minPrice) }),
    ...(maxPrice && { $lte: Number(maxPrice) })
  };
  const items = await Item.find(filter);
  res.json(items);
});

app.post("/api/items", auth, async (req, res) => {
  const item = await Item.create(req.body);
  res.json(item);
});

app.put("/api/items/:id", auth, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

app.delete("/api/items/:id", auth, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ msg: "deleted" });
});

// --- Cart ---
app.get("/api/cart", auth, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate("items.itemId");
  res.json(cart || { items: [] });
});

app.post("/api/cart/add", auth, async (req, res) => {
  const { itemId, quantity } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user.id, "items.itemId": { $ne: itemId } },
    { $push: { items: { itemId, quantity } } },
    { upsert: true, new: true }
  );
  res.json(cart);
});

app.post("/api/cart/remove", auth, async (req, res) => {
  const { itemId } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { items: { itemId } } },
    { new: true }
  );
  res.json(cart);
});

app.listen(process.env.PORT || 4000, () => console.log("Server running"));
