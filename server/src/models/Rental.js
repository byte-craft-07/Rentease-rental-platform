const mongoose = require('mongoose');

const rentalItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    conditionAtDelivery: { type: String, trim: true, default: 'good' },
    conditionAtReturn: { type: String, trim: true, default: '' }
  },
  { _id: true }
);

const rentalSchema = new mongoose.Schema(
  {
    rentalNumber: { type: String, required: true, unique: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [rentalItemSchema], required: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    nextBillingDate: { type: Date, index: true },
    monthlyTotal: { type: Number, required: true, min: 0 },
    depositTotal: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'extended', 'return_requested', 'returned', 'cancelled'], default: 'active', index: true },
    returnRequest: {
      requestedAt: { type: Date },
      preferredPickupDate: { type: Date },
      reason: { type: String, trim: true, default: '' },
      status: { type: String, enum: ['none', 'requested', 'scheduled', 'completed'], default: 'none' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Rental || mongoose.model('Rental', rentalSchema);
