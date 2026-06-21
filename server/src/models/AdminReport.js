const mongoose = require('mongoose');

const adminReportSchema = new mongoose.Schema(
  {
    period: {
      type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    metrics: {
      activeRentals: { type: Number, default: 0, min: 0 },
      monthlyRecurringRevenue: { type: Number, default: 0, min: 0 },
      productUtilizationRate: { type: Number, default: 0, min: 0, max: 100 },
      customerRetentionRate: { type: Number, default: 0, min: 0, max: 100 },
      averageMaintenanceResolutionHours: { type: Number, default: 0, min: 0 },
      openMaintenanceRequests: { type: Number, default: 0, min: 0 },
      pendingReturns: { type: Number, default: 0, min: 0 },
      damageClaimAmount: { type: Number, default: 0, min: 0 }
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

adminReportSchema.index({ 'period.type': 1, 'period.startDate': 1, 'period.endDate': 1 }, { unique: true });

module.exports = mongoose.models.AdminReport || mongoose.model('AdminReport', adminReportSchema);
