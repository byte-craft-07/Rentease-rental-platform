const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorName: { type: String, required: true, trim: true },
    actorRole: { type: String, enum: ['admin', 'vendor'], required: true, index: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
    entityLabel: { type: String, trim: true, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', adminAuditLogSchema);
