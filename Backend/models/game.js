const mongoose = require('mongoose');

// Game Model
const GameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },  
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

// Virtual field for revenue: purchases * price
GameSchema.virtual('revenue').get(function() {
  return this.purchases * this.price;
});

// Ensure virtuals are included in JSON and object outputs
GameSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // Hides __v
  transform: function (doc, ret) {
    delete ret._id; // Removes _id from the output
  }
});

GameSchema.set('toObject', {
  virtuals: true,
  versionKey: false, // Hides __v
  transform: function (doc, ret) {
    delete ret._id; // Removes _id from the output
  }
});

const Game = mongoose.model('Game', GameSchema);
module.exports = Game;