const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { verifyToken } = require('../middleware/authMiddleware'); // Import from authMiddleware

// Route to create a course
router.post('/create', verifyToken, async (req, res) => {
  const { title, description, startDate, endDate, startTime, endTime, location, assignedUser } = req.body;

  try {
    console.log("Course data received:", { title, description, startDate, endDate, startTime, endTime, location, assignedUser });

    const course = new Course({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      assignedUser: assignedUser || null // Assign null if no user is provided
    });

    await course.save();
    console.log("Course successfully saved:", course);

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Route to fetch all courses
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Fetch all courses and populate the assignedUser field
    const courses = await Course.find().populate('assignedUser', 'name');
    res.status(200).json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Route to delete a course by ID
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({ message: 'Course deleted successfully', course: deletedCourse });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});


module.exports = router;
