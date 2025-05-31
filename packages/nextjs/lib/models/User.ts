import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  address: String,
  amount: String,
  value: String
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  portfolio: [PortfolioSchema],
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);