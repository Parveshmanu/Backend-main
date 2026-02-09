import express from 'express';
import { createCheckoutSession } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/create-checkout-session',verifyToken, createCheckoutSession);

export default router;
