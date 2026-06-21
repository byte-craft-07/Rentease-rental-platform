const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    type: { type: String, enum: ['repair', 'replacement', 'inspection', 'pickup_support'], required: true, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
    status: { type: String, enum: ['open', 'assigned', 'scheduled', 'resolved', 'cancelled'], default: 'open', index: true },
    description: { type: String, required: true, trim: true },
    images: [{ type: String, trim: true }],
    scheduledVisit: {
      date: { type: Date },
      timeSlot: { type: String, trim: true, default: '' },
      technicianName: { type: String, trim: true, default: '' }
    },
    resolution: {
      notes: { type: String, trim: true, default: '' },
      resolvedAt: { type: Date },
      cost: { type: Number, default: 0, min: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.MaintenanceRequest || mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
