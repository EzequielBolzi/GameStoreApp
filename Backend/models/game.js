const mongoose = require('mongoose');

// Game Model
const GameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    minimumRequirements: {
      system: String,
      processor: String,
      memory: String,
      graphics: String,
      directX: String,
      storage: String
    },
    recommendedRequirements: {
      system: String,
      processor: String,
      memory: String,
      graphics: String,
      directX: String,
      storage: String
    },
    price: { type: Number, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    averageRating: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', GameSchema);
module.exports = Game;