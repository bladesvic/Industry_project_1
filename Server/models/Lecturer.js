Const mongoose = require('mongoose');

const LecturerSchema = new mongoose.Schema({
  name: String,
  subjects: [String],
  schedule: [{
    day: String,
    time: String,
    subject: String
  }]
});

module.exports = mongoose.model('Lecturer', LecturerSchema);