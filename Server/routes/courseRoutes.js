router.post('/create', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('Request received for course creation:', req.body); // Log the request body
    const { title, description, startDate, endDate, startTime, endTime, location } = req.body;

    const newCourse = new Course({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
    });

    await newCourse.save();
    res.json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    console.error('Error creating course:', error); // Log the error in the backend console
    res.status(500).json({ error: 'Error creating course' });
  }
});

