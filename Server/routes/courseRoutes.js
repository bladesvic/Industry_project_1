const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { verifyToken, hasRole } = require('../middleware/authMiddleware'); // Import from authMiddleware
const { sendCourseUpdateEmail } = require('../emailService'); 



// Route to create a course
router.post('/create', verifyToken, hasRole(['admin']), async (req, res) => {
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
    console.log("Course saved to database:", course); // Log saved course
    res.status(201).json({ message: "Course created successfully", course });
  } catch (err) {
    console.error("Error saving course:", err.errors || err.message); // Log validation/database errors
    res.status(500).json({ error: "Failed to create course" });
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
    // Update the course and fetch the updated document, including the lecturer's details
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { assignedUser: assignedUser || null }, // Assign user or unassign if null
      { new: true }
    ).populate('assignedUser', 'name email');

    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // If a lecturer is assigned, send a notification email
    if (updatedCourse.assignedUser) {
      const { name, email } = updatedCourse.assignedUser;
      const { courseName } = updatedCourse; // Assuming courseName is a field in the Course model

      try {
        await sendCourseUpdateEmail(
          email,
          name,
          courseName,
          `Please check your schedule for updates.`
        );
        console.log(`Notification email sent to ${name} (${email})`);
      } catch (emailErr) {
        console.error('Error sending email notification:', emailErr);
        // Optionally, return a warning in the response
      }
    }

    res.status(200).json({
      message: 'Course updated successfully and notification sent if applicable',
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
