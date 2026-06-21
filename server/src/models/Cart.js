const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    tenureMonths: { type: Number, required: true, min: 1 },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    selectedCity: { type: String, trim: true, default: '' },
    deliveryAddress: {
      line1: { type: String, trim: true, default: '' },
      line2: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      landmark: { type: String, trim: true, default: '' }
    },
    deliveryDate: { type: Date },
    monthlyTotal: { type: Number, default: 0, min: 0 },
    depositTotal: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
