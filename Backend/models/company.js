const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const CompanySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  companyName: { type: String, unique: true },
  role: { type: String, enum: ['company'], default: 'company' },
  password: { type: String}, 
  country: { type: String },
  city: { type: String },
  street: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
  createdAt: { type: Date, default: Date.now },
  profileAvatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });
 
CompanySchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});


CompanySchema.methods.checkPassword = async function(password) {
  try {
    if (!this.password) {
      throw new Error('Password not set for this company');
    }
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error('Error checking password: ' + error.message);
  }
};


CompanySchema.methods.generateAuthToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(
    { 
      _id: this._id, 
      role: this.role,
      email: this.email 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '31d' }
  );
};


CompanySchema.methods.generateResetPasswordToken = function() {
  if (!process.env.JWT_RESET_SECRET) {
    throw new Error('JWT_RESET_SECRET environment variable is not set');
  }
  const resetToken = jwt.sign(
    { _id: this._id },
    process.env.JWT_RESET_SECRET,
    { expiresIn: '1h' }
  );
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;