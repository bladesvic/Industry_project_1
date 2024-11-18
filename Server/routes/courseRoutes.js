const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { verifyToken, hasRole } = require('../middleware/authMiddleware'); // Import from authMiddleware

// Route to create a course
router.post('/create', verifyToken, hasRole(['admin']), async (req, res) => {
  const { title, description, startDate, endDate, startTime, endTime, location, assignedUser } = req.body;

  try {
    const course = new Course({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      assignedUser: assignedUser || null, // Assign null if no user is provided
    });

    await course.save();
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
    const courses = await Course.find().populate('assignedUser', 'name email');
    res.status(200).json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Route to fetch courses assigned to the logged-in user
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract the userId from the token
    const courses = await Course.find({ assignedUser: userId }).populate('assignedUser', 'name email');
    res.status(200).json(courses);
  } catch (err) {
    console.error('Error fetching user courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Route to update a course (assign or reassign lecturer)
router.put('/update/:id', verifyToken, hasRole(['admin']), async (req, res) => {
  const { id } = req.params; // Course ID
  const { assignedUser } = req.body; // User to be assigned

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { assignedUser: assignedUser || null }, // Assign user or unassign if null
      { new: true }
    ).populate('assignedUser', 'name email');

    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Route to delete a course by ID
router.delete('/delete/:id', verifyToken, hasRole(['admin']), async (req, res) => {
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
