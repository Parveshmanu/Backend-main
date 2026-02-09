import express from 'express'
import { getWishList, addToWishList, removeFromWishlist } from '../controllers/wishListController.js'

const router = express.Router()

router.get('/wishlist/:email', getWishList)
router.post('/wishlist', addToWishList)
router.put('/wishlist/remove', removeFromWishlist);

export default router