/**
 * @fileoverview PriceAlert model - stores user-defined price alert rules.
 */

const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ['product', 'hotel', 'flight'],
      required: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    condition: {
      type: String,
      enum: ['below', 'above', 'equals'],
      default: 'below',
    },
    metadata: {
      title: String,
      brand: String,
      category: String,
      location: String,
      route: String,
    },
    status: {
      type: String,
      enum: ['active', 'triggered', 'expired', 'paused'],
      default: 'active',
      index: true,
    },
    triggeredAt: Date,
    lastCheckedPrice: Number,
    notifyEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    trackingUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    priceHistory: [
      {
        price: Number,
        checkedAt: { type: Date, default: Date.now },
      },
    ],
    lastCheckedAt: Date,
  },
  {
    timestamps: true,
  }
);

priceAlertSchema.index({ userId: 1, status: 1, type: 1 });
priceAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
