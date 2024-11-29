const mongoose = require('mongoose');

const LecturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [{ type: String }], // Array of subjects
  schedule: [
    {
      day: { type: String },
      time: { type: String },
      subject: { type: String },
    },
  ],
});

module.exports = mongoose.model('Lecturer', LecturerSchema);
