const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: 'Home' },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    pincode: { type: String, trim: true, required: true },
    landmark: { type: String, trim: true, default: '' },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'vendor'], default: 'customer', index: true },
    city: { type: String, trim: true, default: '' },
    addresses: [addressSchema],
    status: { type: String, enum: ['active', 'blocked', 'inactive'], default: 'active', index: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
