const mongoose = require('mongoose');  
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Company Model
const CompanySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  companyName: { type: String, required: true },
  role: { type: String, enum: ['company'], default: 'company' }, 
  password: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],  // Array of Game references
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: {type: String},
  resetPasswordExpires: {type: Date}
}, { timestamps: true });

// Hash the password before saving
CompanySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
});

// Method to check if password is correct
CompanySchema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate auth token
CompanySchema.methods.generateAuthToken = function() {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '31d' });
};

CompanySchema.methods.generateResetPasswordToken = function() {
  const resetToken = jwt.sign({ _id: this._id }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hora
  return resetToken;
};

const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;
