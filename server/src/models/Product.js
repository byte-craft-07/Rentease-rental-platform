const mongoose = require('mongoose');

const tenureOptionSchema = new mongoose.Schema(
  {
    months: { type: Number, required: true, min: 1 },
    monthlyRent: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    type: { type: String, enum: ['furniture', 'appliance', 'bundle', 'decor'], required: true, index: true },
    shortDescription: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    tenureOptions: { type: [tenureOptionSchema], default: [] },
    stock: { type: Number, required: true, min: 0 },
    availableStock: { type: Number, required: true, min: 0 },
    serviceCities: [{ type: String, trim: true, index: true }],
    images: [{ type: String, trim: true }],
    specifications: { type: Map, of: String, default: {} },
    maintenanceIncluded: { type: Boolean, default: true },
    deliveryWindowDays: { type: Number, default: 2, min: 0 },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['active', 'draft', 'retired'], default: 'active', index: true }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', shortDescription: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
