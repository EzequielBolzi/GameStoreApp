const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: { type: String,  unique: true },
  username: { type: String, unique: true },
  password: { type: String},
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ['user'], default: 'user' }, 
  dateOfBirth: { type: Date },
  phoneNumber: { type: String },
  cardName: { type: String },
  cardNumber: { type: String },
  cardExpiration: { type: String },
  cardCVV: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
  purchasedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
  createdAt: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  resetPasswordToken: {type: String},
  resetPasswordExpires: {type: Date}
});

// Hash the password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
});

// Method to check if password is correct
UserSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate auth token
UserSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '31d' });
  };


UserSchema.methods.generateResetPasswordToken = function() {
    const resetToken = jwt.sign({ _id: this._id }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    return resetToken;
  };

const User = mongoose.model('User', UserSchema);

module.exports = User;