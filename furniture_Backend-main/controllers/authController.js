import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()
import { registerSchema, loginSchema } from "../validation/auth.js";
import { asyncErrorHandling } from "../helper/asyncErrorHandling.js";


const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '20m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};


export const registerUser = asyncErrorHandling(async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return next(new Error(error.details[0].message));
  }

  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new Error("User already exists"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ message: "User registered successfully" });
});



export const loginUser = asyncErrorHandling(async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return next(new Error(error.details[0].message));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new Error("User not found"));
  }

  if (user.blocked) {
    return next(new Error("Account is blocked"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new Error("Invalid credentials"));
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: accessToken
  });
});


export const refreshAccessToken = asyncErrorHandling(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return next(new Error("No refresh token"));
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(new Error("Invalid refresh token"));
    }

    const accessToken = generateAccessToken(user);
    res.json({ token: accessToken });
  });
});


export const logoutUser = asyncErrorHandling(async (req, res, next) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});