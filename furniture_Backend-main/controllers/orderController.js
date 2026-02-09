import { asyncErrorHandling } from "../helper/asyncErrorHandling.js";
import Order from "../models/order.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import mongoose from 'mongoose';


export const createOrder = asyncErrorHandling(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  const requiredFields = { userId, shippingAddress, paymentMethod };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      return next(new Error(`Missing required field: ${field}`));
    }
  }

  const { address, city, postalCode, country } = shippingAddress;
  if (!address || !city || !postalCode || !country) {
    return next(new Error("Shipping address must include address, city, postalCode, and country"));
  }

  const validPaymentMethods = ['Stripe', 'Cash on Delivery'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return next(new Error(`Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`));
  }

  const user = await User.findById(userId);
  if (!user) return next(new Error("User not found"));

  const cartItems = user.cart || [];
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return next(new Error("Cart is empty. Cannot place order."));
  }

  const fullCartItems = await Promise.all(cartItems.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) {
      return next(new Error(`Product with ID ${item.productId} not found`));
    }
    return {
      productId: item.productId,
      name: product.name,
      price: product.price,
      oldprice: product.oldprice,
      off: product.off,
      image: product.image,
      category: product.category,
      quantity: item.quantity
    };
  }));


  for (const item of fullCartItems) {
    if (!item.productId || !item.name || !item.quantity || !item.price) {
      return next(new Error("Each cart item must have productId, name, quantity, and price"));
    }
  }

  const totalAmount = fullCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);



  const paymentStatus = paymentMethod === "Cash on Delivery" ? "pending" : "processing";
  const orderStatus = "processing";

  const newOrder = new Order({
    userId,
    userName: user.name,
    items: fullCartItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    orderStatus
  });

  const savedOrder = await newOrder.save();

  user.purchaseHistory.push(savedOrder._id);
  user.cart = []; 
  await user.save();

  res.status(201).json({
    success: true,
    order: savedOrder
  });
});



export const getUserOrders = asyncErrorHandling(async (req, res, next) => {
  const requestedUserId = req.params.userId;

  if (req.user.role !== 'admin' && requestedUserId !== req.user.id.toString()) {
    return next(new Error("Not authorized to view these orders"));
  }

  const orders = await Order.find({ userId: requestedUserId }).sort({ createdAt: -1 }).lean();
  
  const formattedOrders = orders.map(order => ({
    ...order,
    _id: order._id.toString(),
    userId: order.userId.toString(),
    items: order.items.map(item => ({
      ...item,
      _id: item._id?.toString(),
      productId: item.productId?.toString()
    }))
  }));

  res.status(200).json({
    success: true,
    count: formattedOrders.length,
    orders: formattedOrders
  });
});



export const updateOrderPaymentStatus = asyncErrorHandling(async (req, res, next) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  const order = await Order.findById(orderId).populate('userId');
  if (!order) return next(new Error('Order not found'));

  if (!['paid', 'pending', 'refunded'].includes(paymentStatus)) {
    return next(new Error('Invalid payment status'));
  }

  if (paymentStatus === 'paid') {
    if (order.paymentMethod === 'Cash on Delivery' && order.orderStatus !== 'delivered') {
      return next(new Error('Cannot mark COD order as paid before it is delivered'));
    }

    if (order.paymentStatus === 'paid') {
      return next(new Error('Order is already marked as paid'));
    }

    order.paymentStatus = 'paid';
  } else {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    order,
  });
});


export const cancelOrder = asyncErrorHandling(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new Error('Order not found'));

  if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
    return next(new Error('Unauthorized to cancel this order'));
  }

  order.orderStatus = 'cancelled';
  await order.save();

  res.json({ success: true, order });
});




export const getAllOrders = asyncErrorHandling(async (req, res, next) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
});



export const updateOrderStatus = asyncErrorHandling(async (req, res, next) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(orderStatus)) {
    return next(new Error('Invalid order status'));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new Error('Order not found'));

  order.orderStatus = orderStatus;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    order
  });
});




export const getOrderById = asyncErrorHandling(async (req, res, next) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new Error("Invalid order ID"));
  }

  const order = await Order.findById(orderId).lean();
  if (!order) return next(new Error("Order not found"));

  res.status(200).json(order);
});
