  import mongoose from "mongoose";

  const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, default: 'user' },
    blocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
          quantity: { type: Number, default: 1 },
          name: String,
          price: Number,
          oldprice: Number,
          off: Number,
          image: String,
          category: String
      }
    ],
    purchaseHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    ],
    wishlist: [{
      productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
      },
      shortname: String,
      name: String,
      image: String,
      price: Number,
      oldprice: Number,
      category: String
  }]
  });

  const User = mongoose.model("User", userSchema);

  export default User;
