const mongoose = require('mongoose');

const damageClaimSchema = new mongoose.Schema(
  {
    claimNumber: { type: String, required: true, unique: true, index: true },
    rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    description: { type: String, required: true, trim: true },
    claimAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['open', 'under_review', 'approved', 'rejected', 'settled'], default: 'open', index: true },
    evidence: [{ type: String, trim: true }],
    resolutionNotes: { type: String, trim: true, default: '' },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.DamageClaim || mongoose.model('DamageClaim', damageClaimSchema);
