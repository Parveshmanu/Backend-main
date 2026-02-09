import { asyncErrorHandling } from "../helper/asyncErrorHandling.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import Product from "../models/product.js";

export const addToCart = asyncErrorHandling(async (req, res, next) => {
  const { email, product } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found"));

  const productFromDB = await Product.findById(product.productId);
  if (!productFromDB) return next(new Error("Product not found"));

  const existingProduct = user.cart.find(
    item => item.productId.toString() === product.productId
  );

  if (existingProduct) {
    existingProduct.quantity += product.quantity;
  } else {
    user.cart.push({
      productId: productFromDB._id,
      name: productFromDB.name,
      price: productFromDB.price,
      oldprice: productFromDB.oldprice,
      off: productFromDB.off,
      image: productFromDB.image,
      category: productFromDB.category,
      quantity: product.quantity
    });
  }

  await user.save();
  res.status(200).json({ message: "Product added to cart", cart: user.cart });
});




export const removeFromCart = asyncErrorHandling(async (req, res, next) => {
  const { email, productId } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found"));

  user.cart = user.cart.filter(item => item.productId.toString() !== productId);
  await user.save();
  res.status(200).json({ message: "Product removed from cart", cart: user.cart });
});



export const addToPurchaseHistory = asyncErrorHandling(async (req, res, next) => {
  const { email, productId, name, image, price, quantity, category } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found"));

  const newPurchase = { productId, name, image, price, quantity, category };

  user.purchaseHistory.push(newPurchase);
  user.cart = user.cart.filter(item => item.productId.toString() !== productId);
  await user.save();

  res.status(200).json({ message: "Purchase added to history" });
});



export const getCart = asyncErrorHandling(async (req, res, next) => {
  const user = await User.findById(req.params.userId).populate("cart.productId");
  if (!user) return next(new Error("User not found"));

  const cartItems = user.cart.map(item => ({
    _id: item.productId.id,
    quantity: item.quantity,
    name: item.productId.name,
    price: item.productId.price,
    oldprice: item.productId.oldprice,
    off: item.productId.off,
    image: item.productId.image,
    category: item.productId.category
  }));

  res.status(200).json({ cart: cartItems });
});



export const updateCart = asyncErrorHandling(async (req, res, next) => {
  const { cart } = req.body;
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) return next(new Error("User not found"));

  user.cart = cart.map(item => ({
    productId: new mongoose.Types.ObjectId(item.productId),
    quantity: item.quantity
  }));
  await user.save();
  res.json({ message: "Cart updated", cart: user.cart });
});



export const savePurchaseHistory = asyncErrorHandling(async (req, res, next) => {
  const newOrder = req.body.purchaseHistory;
  const user = await User.findById(req.params.userId);
  if (!user) return next(new Error("User not found"));

  user.purchaseHistory.push(newOrder);
  await user.save();
  res.json({ message: "Purchase history updated", history: user.purchaseHistory });
});
