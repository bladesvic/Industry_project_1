const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // Use `passwordHash` consistently
  role: { type: String, enum: ['admin', 'lecturer', 'user'], default: 'user' }, // Updated default to 'user'
  teachingAbility: { type: Number, min: 1, max: 10, default: null }, // Teaching ability only for lecturers
});

// Method to hash the password
userSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

// Model export
module.exports = mongoose.model('User', userSchema);
