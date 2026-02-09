import Stripe from 'stripe';
import dotenv from 'dotenv';
import { asyncErrorHandling } from '../helper/asyncErrorHandling.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const createCheckoutSession = asyncErrorHandling(async (req, res, next) => {
    const { products, orderId } = req.body;
    if (!req.user) {
        return next(new Error("Not authenticated"));
    }

    if (!Array.isArray(products) || products.length === 0) {
        return next(new Error("Products must be a non-empty array"));
    }

    if (!orderId) {
        return next(new Error("Order ID is required"));
    }

    const line_items = [];

    for (const product of products) {
        if (!product.name || !product.image || !product.price || !product.quantity) {
        return next(new Error("Each product must have name, image, price, and quantity"));
        }

        line_items.push({
        price_data: {
            currency: 'inr',
            product_data: {
            name: product.name,
            images: [product.image],
            },
            unit_amount: Math.round(product.price * 100),
        },
        quantity: product.quantity,
        });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `http://localhost:5173/furniture_e_commerce/#/success/${orderId}`,
        cancel_url: `http://localhost:5173/furniture_e_commerce/#/failed`,
        metadata: { orderId },
        customer_email: req.user.email,
    });

    res.status(200).json({
        success: true,
        id: session.id,
        url: session.url,
    });
});
