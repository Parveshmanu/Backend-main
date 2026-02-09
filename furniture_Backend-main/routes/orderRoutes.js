import express from 'express';
import { 
    createOrder, 
    getUserOrders, 
    updateOrderPaymentStatus,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderById
} from '../controllers/orderController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();


router.post('/', verifyToken, createOrder);
router.get('/user/:userId', verifyToken, getUserOrders);

router.patch('/:id/cancel', cancelOrder)

router.patch('/:orderId/payment-status', verifyToken, verifyAdmin, updateOrderPaymentStatus);
router.get('/allOrder', verifyToken, verifyAdmin, getAllOrders)
router.put('/update-status/:orderId', verifyToken, verifyAdmin, updateOrderStatus)
router.get("/:orderId", verifyToken, verifyAdmin, getOrderById)


export default router;