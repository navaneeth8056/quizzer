const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: { type: String },
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  dateOfBirth: { type: Date },
  phoneNumber: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  fikaPoints: { type: Number, default: 100 },
  quizScores: [{
    chapter: Number,
    score: Number,
    date: { type: Date, default: Date.now }
  }],
  unlockedModules: {
    type: Map,
    of: [Number], // e.g., { '1': [1,2], '2': [1] } means chapter 1 modules 1 and 2 unlocked, chapter 2 module 1 unlocked
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has password (traditional user)
userSchema.methods.hasPassword = function() {
  return !!this.password;
};

module.exports = mongoose.model('User', userSchema); 