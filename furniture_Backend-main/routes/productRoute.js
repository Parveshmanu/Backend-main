import express from "express";
import { getProductById, getProductsByCategory, getProducts, deleteProduct, updateProduct, addProduct } from "../controllers/productController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { upload } from "../middleware/multer.js"
const router = express.Router();

router.get('/', getProductsByCategory);

router.get("/all", verifyToken, verifyAdmin,  getProducts)
router.get('/:id', verifyToken, getProductById)

router.patch('/:id', verifyToken, verifyAdmin, deleteProduct);
router.put('/:id', verifyToken, verifyAdmin, updateProduct);

router.post('/', verifyToken, verifyAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]), addProduct);

export default router;
