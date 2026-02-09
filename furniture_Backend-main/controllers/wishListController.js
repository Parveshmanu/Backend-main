import User from '../models/user.js';
import mongoose from 'mongoose';
import { asyncErrorHandling } from '../helper/asyncErrorHandling.js';



export const getWishList = asyncErrorHandling(async (req, res, next) => {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
        return next(new Error("User not found"));
    }

    const cleanWishlist = user?.wishlist?.filter(item => item !== null) || [];
    res.status(200).json(cleanWishlist);
});



export const addToWishList = asyncErrorHandling(async (req, res, next) => {
    const { email, wishlist } = req.body;
    if (!wishlist || !Array.isArray(wishlist)) {
        return next(new Error("Wishlist array is required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new Error("User not found"));
    }

    const newItems = wishlist.map(item => ({
        ...item,
        productId: new mongoose.Types.ObjectId(item.productId)
    }));

    user.wishlist.push(...newItems);
    await user.save();

    res.status(200).json({ wishlist: user.wishlist });
});



export const removeFromWishlist = asyncErrorHandling(async (req, res, next) => {
    const { email, productId } = req.body;
    if (!email || !productId) {
        return next(new Error("Both email and productId are required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new Error("User not found"));
    }

    const initialLength = user.wishlist.length;

    user.wishlist = user.wishlist.filter(
        item => item && String(item.productId) !== String(productId)
    );

    if (user.wishlist.length === initialLength) {
        return res.status(200).json({
            message: "Item not found in wishlist",
            wishlist: user.wishlist
        });
    }

    await user.save();

    res.status(200).json({
        message: "Item removed",
        wishlist: user.wishlist
    });
});
