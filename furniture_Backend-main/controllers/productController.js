import { asyncErrorHandling } from "../helper/asyncErrorHandling.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

export const getProductById = asyncErrorHandling(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new Error('Invalid product ID format'));
  }

    const product = await Product.findById(id);
    if (!product) {
      return next(new Error('Product not found'));
    }

    res.status(200).json(product);
})

export const getProductsByCategory = asyncErrorHandling( async (req, res, next) => {
    const { category } = req.query;
    const relatedProducts = await Product.find({ category , isDelete: false });
    if (!relatedProducts) {
      return next(new Error('No products found in this category'));
    }

    res.json(relatedProducts);
})

export const getProducts = asyncErrorHandling( async (req, res, next) => {
  const products = await Product.find();
  if (!products) {
    return next(new Error('No products found'));
  }

  res.status(200).json(products);
})


// Admin Panel

export const deleteProduct = asyncErrorHandling(  async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new Error('Invalid product ID format'));
  }

  const product = await Product.findById(id);
    if (!product) {
      return next(new Error('Product not found'));
    }
    
    const newIsDelete = !product.isDelete
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isDelete: newIsDelete },
      { new: true }
    );

      res.status(200).json({ success: true, message: `Product ${newIsDelete ? 'soft-deleted' : 'restored'} successfully`, product: updatedProduct });
})


export const updateProduct = asyncErrorHandling( async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new Error('Invalid product ID'));
  }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) {
      return next(new Error('Product not found'));
    }

    res.status(200).json(updatedProduct);
})

export const addProduct = async (req, res, next) => {
  try {
    const {
      category, shortname, name, brand, material, collections,
      dimensionscm, dimensionsinch, type, seatingheight, weight,
      price, oldprice, off, rating, ratingstar,
    } = req.body;

    const images = req.files;

    const newProduct = new Product({
      category,
      shortname,
      name,
      brand,
      material,
      collections,
      dimensionscm,
      dimensionsinch,
      type,
      seatingheight,
      weight,
      price,
      oldprice,
      off,
      rating,
      ratingstar,
      image: images?.image?.[0]?.path || '',
      image1: images?.image1?.[0]?.path || '',
      image2: images?.image2?.[0]?.path || '',
      image3: images?.image3?.[0]?.path || '',
    });

    await newProduct.save();

    return res.status(201).json({ message: 'Product added', product: newProduct });
  } catch (error) {
    console.error("Error in addProduct:", error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
