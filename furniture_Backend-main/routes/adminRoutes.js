import express from 'express';
import {
    getAllUsers,
    deleteUser,
    toggleBlockUser,
    getUserById
} from '../controllers//adminController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.get('/:id', verifyToken, verifyAdmin, getUserById);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);
router.patch('/:id', verifyToken, verifyAdmin, toggleBlockUser);

export default router;
