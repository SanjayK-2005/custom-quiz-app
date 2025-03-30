// models/user.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true, // Ensure email is unique
    required: true,
  },
  emailVerified: {
    // Used by NextAuth adapter to track email verification (often null initially)
    type: Date,
    default: null,
  },
  image: {
    // URL to the user's profile picture
    type: String,
  },
  // You can add other fields specific to your application here
  // e.g., role: { type: String, default: 'user' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the 'updatedAt' field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent model overwrite during hot-reloading
export default mongoose.models.User || mongoose.model('User', UserSchema);