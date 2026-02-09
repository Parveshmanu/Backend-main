import express from "express";
import {
  addToCart,
  removeFromCart,
  addToPurchaseHistory,
  getCart,
  updateCart,
  savePurchaseHistory
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/cart/add",verifyToken, addToCart);
router.post("/purchase-history/add",verifyToken, addToPurchaseHistory);
router.get("/cart/:userId",verifyToken, getCart);
router.put("/cart/:userId", updateCart);
router.post("/remove-from-cart",verifyToken, removeFromCart);
router.put("/users/:userId/purchaseHistory",verifyToken, savePurchaseHistory);

export default router;
