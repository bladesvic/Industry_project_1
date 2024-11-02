const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },  // Add any other fields you need, like name
  role: { type: String, default: 'lecturer' } // Add roles if needed (e.g., admin, manager, lecturer)
});

// Method to hash the password
UserSchema.methods.setPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', UserSchema);
