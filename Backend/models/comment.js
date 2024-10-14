const mongoose = require('mongoose');  
const User = require('../models/user');
const Game = require('../models/game');
const Company = require('../models/company');

// Comment Model
const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  });
  
  const Comment = mongoose.model('Comment', CommentSchema);
  
  module.exports = { User, Company, Game, Comment };