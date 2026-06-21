const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    type: { type: String, enum: ['furniture', 'appliance', 'bundle', 'decor'], required: true, index: true },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
