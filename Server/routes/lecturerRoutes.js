const express = require('express');
const router = express.Router();
const Lecturer = require('../models/Lecturer');

// Example: Add a new lecturer
router.post('/add', async (req, res) => {
  try {
    const lecturer = new Lecturer(req.body);
    await lecturer.save();
    res.status(201).send(lecturer);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
