import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoute.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import wishlistRoute from './routes/wishlistRoute.js'
import cartRoutes from './routes/cartRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import orderRoutes from "./routes/orderRoutes.js"
import adminRoutes from './routes/adminRoutes.js'

const app = express();

connectDB();
  
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
};

app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/users', wishlistRoute)
app.use("/api/user", cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use("/users", adminRoutes);

app.use(notFound);
app.use(errorHandler);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});