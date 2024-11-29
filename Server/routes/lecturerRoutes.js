const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { verifyToken, hasRole } = require('../middleware/authMiddleware');

// Test Route
router.get('/test', verifyToken, hasRole(['admin', 'user']), (req, res) => {
  res.status(200).json({ message: 'Middleware test successful', user: req.user });
});

// Finding Eligible Lecturers
router.post('/available', verifyToken, hasRole(['admin', 'user']), async (req, res) => {
  const { courseId } = req.body;

  try {
    // Validate course ID and fetch details
    const course = await Course.findById(courseId);
    if (!course) {
      console.error('Course not found:', courseId);
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log('Course details:', {
      title: course.title,
      startDate: course.startDate,
      endDate: course.endDate,
    });

    // Fetch all lecturers
    const lecturers = await User.find({ role: 'lecturer' });
    console.log('All lecturers:', lecturers.map((lect) => lect.name));

    // Check eligibility
    const eligibleLecturers = await Promise.all(
      lecturers.map(async (lecturer) => {
        const assignedCourses = await Course.find({ assignedUser: lecturer._id });

        console.log(`Lecturer ${lecturer.name} assigned courses:`, assignedCourses.map(course => ({
          title: course.title,
          startDate: course.startDate,
          endDate: course.endDate,
        })));

        // Filter invalid dates
        const validAssignedCourses = assignedCourses.filter((assignedCourse) => {
          const startDate = new Date(assignedCourse.startDate);
          const endDate = new Date(assignedCourse.endDate);
          if (startDate > endDate) {
            console.warn(`Skipping invalid course dates for ${assignedCourse.title}`);
            return false;
          }
          return true;
        });

        // Check overlaps
        const overlappingCourses = validAssignedCourses.filter((assignedCourse) => {
          const courseStart = new Date(course.startDate);
          const courseEnd = new Date(course.endDate);
          const assignedCourseStart = new Date(assignedCourse.startDate);
          const assignedCourseEnd = new Date(assignedCourse.endDate);

          const isOverlapping =
            courseStart <= assignedCourseEnd && courseEnd >= assignedCourseStart;

          console.log(
            `Checking overlap for ${lecturer.name} with course ${assignedCourse.title}:`,
            { courseStart, courseEnd, assignedCourseStart, assignedCourseEnd, isOverlapping }
          );

          return isOverlapping;
        });

        console.log(
          `Lecturer ${lecturer.name} overlapping courses count:`,
          overlappingCourses.length
        );

        return overlappingCourses.length < 2 ? lecturer : null; // Include if less than 2 overlaps
      })
    );

    const filteredLecturers = eligibleLecturers.filter(Boolean);

    console.log('Eligible lecturers:', filteredLecturers.map((lect) => lect.name));

    res.status(200).json(filteredLecturers);
  } catch (err) {
    console.error('Error in /available route:', err);
    res.status(500).json({ error: 'Failed to fetch eligible lecturers' });
  }
});

// Export router
module.exports = router;
