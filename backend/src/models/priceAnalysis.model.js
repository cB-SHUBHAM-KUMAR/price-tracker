/**
 * @fileoverview PriceAnalysis model — stores individual price analysis results.
 */

const mongoose = require('mongoose');

const priceAnalysisSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['product', 'hotel', 'flight'],
      required: true,
      index: true,
    },
    inputPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: {
      fairPrice: Number,
      fairPriceRange: {
        min: Number,
        max: Number,
      },
      currentPrice: Number,
      pricePosition: String,
      priceDeviation: Number,
      surgeDetected: Boolean,
      dynamicScore: Number,
      confidenceScore: Number,
      buyRecommendation: String,
      reasoningSummary: String,
      analyzedAt: Date,
    },
    pricePosition: {
      type: String,
      enum: ['Underpriced', 'Good Deal', 'Fair', 'Slightly Inflated', 'Overpriced'],
      index: true,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
priceAnalysisSchema.index({ createdAt: -1 });
priceAnalysisSchema.index({ type: 1, pricePosition: 1 });

module.exports = mongoose.model('PriceAnalysis', priceAnalysisSchema);
