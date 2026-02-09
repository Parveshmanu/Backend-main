import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    category: String,
    shortname: String,
    name: String,
    brand: String,
    material: String,  
    collections: String,
    dimensionscm: String,
    dimensionsinch: String,
    type: String,
    seatingheight: String,  
    weight: Number,
    price: Number,
    oldprice: Number,
    off: Number,
    rating: Number,
    ratingstar: Number,
    image:  String ,
    image1: String,
    image2: String,
    image3: String,
    isDelete: { type: Boolean, default: false }
});


const Product = mongoose.model('Product', productSchema);
export default Product;