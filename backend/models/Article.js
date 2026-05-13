const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    number: { type: String }, // "21", "21A", "368" etc
    title: { type: String },
    content: { type: String, required: true },
    part: { type: String }, // Part III, Part IV etc
    chapter: { type: String },
    type: {
      type: String,
      enum: ['article', 'schedule', 'preamble', 'amendment', 'other'],
      default: 'article',
    },
    tags: [String],
    chunkIndex: { type: Number, default: 0 }, // for multi-chunk articles
    wordCount: { type: Number },
    // Simple search index
    searchText: { type: String }, // lowercased combined text for searching
  },
  { timestamps: true }
);

// Text index for full-text search
articleSchema.index({ searchText: 'text', number: 1 });
articleSchema.index({ number: 1, chunkIndex: 1 });

module.exports = mongoose.model('Article', articleSchema);
