const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { verifyToken, hasRole } = require('../middleware/authMiddleware');

// Route to create a course (Admins, Users, and Lecturers can create courses)
router.post('/create', verifyToken, hasRole(['admin', 'user', 'lecturer']), async (req, res) => {
  const { title, description, startDate, endDate, startTime, endTime, location, assignedUser } = req.body;

  console.log("Received course data:", req.body); // Log incoming request data

  try {
    if (!title || !startDate || !endDate || !startTime || !endTime) {
      console.error("Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }

    const course = new Course({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      assignedUser: assignedUser || null,
    });

    await course.save();
    console.log("Course saved to database:", course);
    res.status(201).json({ message: "Course created successfully", course });
  } catch (err) {
    console.error("Error saving course:", err.errors || err.message);
    res.status(500).json({ error: "Failed to create course" });
  }
});

// Route to fetch all courses (Admins, Lecturers, and Users)
router.get('/all', verifyToken, hasRole(['admin', 'lecturer', 'user']), async (req, res) => {
  try {
    console.log(`Fetching all courses for role: ${req.user.role}`);
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
    const userId = req.user.userId;
    console.log(`Fetching courses for user: ${userId}`);
    const courses = await Course.find({ assignedUser: userId }).populate('assignedUser', 'name email');
    res.status(200).json(courses);
  } catch (err) {
    console.error('Error fetching user courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Route to update a course (Admins, Users, and Lecturers can update courses)
router.put('/update/:id', verifyToken, hasRole(['admin', 'user', 'lecturer']), async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate, location, assignedUser, startTime = '01:00', endTime = '13:00' } = req.body;

  try {
    console.log(`Updating course with ID: ${id}`);
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Handle assignedUser
    if (assignedUser !== undefined) {
      course.assignedUser = assignedUser;
    }

    // Update other fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (startDate) course.startDate = startDate;
    if (endDate) course.endDate = endDate;
    if (location) course.location = location;
    if (startTime) course.startTime = startTime;
    if (endTime) course.endTime = endTime;

    await course.save();
    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Route to delete a course (Admins and Users can delete any course; Lecturers cannot)
router.delete('/delete/:id', verifyToken, hasRole(['admin', 'user']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting course with ID: ${id}`);

    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      console.error("Course not found for deletion");
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log("Course deleted successfully:", deletedCourse);
    res.status(200).json({ message: 'Course deleted successfully', course: deletedCourse });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
