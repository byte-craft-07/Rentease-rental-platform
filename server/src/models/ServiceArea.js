const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true, unique: true, index: true },
    state: { type: String, required: true, trim: true },
    pincodes: [{ type: String, trim: true }],
    deliveryFee: { type: Number, default: 0, min: 0 },
    pickupFee: { type: Number, default: 0, min: 0 },
    standardDeliveryDays: { type: Number, default: 2, min: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.ServiceArea || mongoose.model('ServiceArea', serviceAreaSchema);
