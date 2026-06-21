const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    tenureMonths: { type: Number, required: true, min: 1 },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    deliveryAddress: {
      line1: { type: String, trim: true, required: true },
      line2: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, required: true },
      state: { type: String, trim: true, required: true },
      pincode: { type: String, trim: true, required: true },
      landmark: { type: String, trim: true, default: '' }
    },
    deliveryDate: { type: Date, required: true, index: true },
    pickupDate: { type: Date },
    monthlyTotal: { type: Number, required: true, min: 0 },
    depositTotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, enum: ['pending', 'authorized', 'paid', 'failed', 'refunded'], default: 'pending', index: true },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'scheduled', 'delivered', 'cancelled', 'completed'],
      default: 'placed',
      index: true
    },
    notes: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
