const mongoose = require('mongoose');

const GameViewSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewedAt: { type: Date, default: Date.now }
});

GameViewSchema.index({ game: 1, user: 1 }, { unique: true });

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
  discountPercentage: { type: Number },
  salePrice: { type: Number },
  saleEndDate: { type: Date },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  isPublished: { type: Boolean, default: false },
  uniqueViews: { type: Number, default: 0 }, 
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  averageRating: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }, 
  createdAt: { type: Date, default: Date.now },
  gamePhoto: { type: String, required: true}
});

//virtual to check if the game is currently on sale
GameSchema.virtual('isOnSale').get(function() {
  return this.salePrice && this.saleEndDate && new Date() < this.saleEndDate;
});

GameSchema.pre('save', function(next) {
  // Calculate sale price if there's a discount percentage
  if (this.discountPercentage > 0) {
    // Round to 2 decimal places
    this.salePrice = Number((this.price * (1 - this.discountPercentage / 100)).toFixed(2));
  }

  // Clear sale if it's expired
  if (this.saleEndDate && new Date() > this.saleEndDate) {
    this.salePrice = undefined;
    this.saleEndDate = undefined;
    this.discountPercentage = undefined;
  }
  
  next();
});
// Ensure virtuals are included in JSON and object outputs
GameSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, 
  transform: function (doc, ret) {
    delete ret._id; 
  }
});

GameSchema.set('toObject', {
  virtuals: true,
  versionKey: false, 
  transform: function (doc, ret) {
    delete ret._id; 
  }
});

const Game = mongoose.model('Game', GameSchema);
const GameView = mongoose.model('GameView', GameViewSchema);

module.exports = { Game, GameView };
