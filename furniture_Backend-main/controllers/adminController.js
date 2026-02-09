import User from '../models/user.js';
import { asyncErrorHandling } from '../helper/asyncErrorHandling.js';

export const getAllUsers = asyncErrorHandling(async (req, res, next) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
});

export const deleteUser = asyncErrorHandling(async (req, res, next) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
        return next(new Error("User not found"));
    }
    res.status(200).json({ message: "User deleted successfully" });
});

export const toggleBlockUser = asyncErrorHandling(async (req, res, next) => {
    const { blocked } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { blocked },
        { new: true }
    );
    if (!updatedUser) {
        return next(new Error("User not found"));
    }
    res.status(200).json(updatedUser);
});

export const getUserById = asyncErrorHandling(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new Error("User not found"));
    }
    res.status(200).json(user);
});
