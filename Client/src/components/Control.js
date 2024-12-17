import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Control() {
  const [courses, setCourses] = useState([]);
  const [helpAlerts, setHelpAlerts] = useState([]);
  const [overloadedTerms, setOverloadedTerms] = useState({});
  const [invalidCourses, setInvalidCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');  // Added feedback state

  useEffect(() => {
    fetchCourses();
  }, [selectedYear]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedCourses = Array.isArray(response.data) ? response.data : [];

      // Process Help Alerts (all start dates after year 9000)
      const alerts = fetchedCourses.filter((course) => {
        const year = new Date(course.startDate).getFullYear();
        return year > 9000;
      });
      setHelpAlerts(alerts);

      // Filter courses by selected year
      const yearFilteredCourses = fetchedCourses.filter((course) => {
        const year = new Date(course.startDate).getFullYear();
        return year === selectedYear;
      });

      // Exclude invalid courses (endDate before startDate)
      const validCourses = yearFilteredCourses.filter(
        (course) => new Date(course.endDate) >= new Date(course.startDate)
      );

      // Collect invalid courses
      const invalidCourses = yearFilteredCourses.filter(
        (course) => new Date(course.endDate) < new Date(course.startDate)
      );

      setCourses(validCourses);
      setInvalidCourses(invalidCourses);

      // Process Overloaded Terms
      const overloaded = processOverloadedTerms(validCourses);
      setOverloadedTerms(overloaded);

      setError('');
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load course data.');
    }
  };

  const deleteInvalidCourse = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/courses/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvalidCourses((prev) => prev.filter((course) => course._id !== id));
      setFeedback('Invalid course deleted successfully!');
    } catch (err) {
      console.error('Error deleting invalid course:', err);
      setFeedback('Failed to delete invalid course.');
    }
  };

  const handleRemoveLecturer = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/courses/update/${courseId}`,
        { assignedUser: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Manually update the UI to remove the lecturer from the course list
      const updatedCourses = courses.map(course =>
        course._id === courseId ? { ...course, assignedUser: null } : course
      );
      setCourses(updatedCourses); // Update the courses state
      setFeedback('Lecturer successfully removed!');
    } catch (err) {
      console.error('Error removing lecturer:', err);
      setFeedback('Failed to remove lecturer.');
    }
  };

  const resolveHelpAlert = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/courses/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHelpAlerts((prevAlerts) => prevAlerts.filter((alert) => alert._id !== id));
      console.log(`Help alert with ID ${id} resolved and deleted successfully.`);
    } catch (err) {
      console.error('Error resolving help alert:', err.response?.data || err.message);
      alert('Failed to resolve help alert.');
    }
  };

  const processOverloadedTerms = (courses) => {
    const terms = {
      term1: { name: 'Term 1: Feb - Apr', lecturers: {} },
      term2: { name: 'Term 2: May - Jul', lecturers: {} },
      term3: { name: 'Term 3: Aug - Oct', lecturers: {} },
      term4: { name: 'Term 4: Nov - Jan', lecturers: {} },
    };

    courses.forEach((course) => {
      const startDate = new Date(course.startDate);

      if (startDate <= new Date(`${selectedYear}-04-30`)) {
        addCourseToLecturer(terms.term1.lecturers, course);
      }
      if (startDate >= new Date(`${selectedYear}-05-01`) && startDate <= new Date(`${selectedYear}-07-31`)) {
        addCourseToLecturer(terms.term2.lecturers, course);
      }
      if (startDate >= new Date(`${selectedYear}-08-01`) && startDate <= new Date(`${selectedYear}-10-31`)) {
        addCourseToLecturer(terms.term3.lecturers, course);
      }
      if (startDate >= new Date(`${selectedYear}-11-01`)) {
        addCourseToLecturer(terms.term4.lecturers, course);
      }
    });

    // Filter out lecturers with <= 2 courses and "Unassigned"
    Object.values(terms).forEach((term) => {
      Object.keys(term.lecturers).forEach((lecturer) => {
        if (term.lecturers[lecturer].length <= 2 || lecturer === 'Unassigned') {
          delete term.lecturers[lecturer];
        }
      });
    });

    return terms;
  };

  const addCourseToLecturer = (termLecturers, course) => {
    const lecturerName = course.assignedUser?.name || 'Unassigned';
    if (!termLecturers[lecturerName]) termLecturers[lecturerName] = [];
    termLecturers[lecturerName].push(course);
  };

  return (
    <div className="schedule-container">
      <h2>Control Panel</h2>
      {error && <p className="error">{error}</p>}
      {feedback && <div className="feedback-message">{feedback}</div>} {/* Display feedback */}
  
      {/* Help Alerts */}
      <section>
        <h3>Help Alerts</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {helpAlerts.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{new Date(course.startDate).toLocaleDateString()}</td>
                <td>{new Date(course.endDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => resolveHelpAlert(course._id)}>Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Year Selection Below Overloaded Terms */}
      <div className="year-selection" style={{ marginTop: '20px' }}>
        <h3>Year Selection</h3>
        <button onClick={() => setSelectedYear(selectedYear - 1)}>Previous Year</button>
        <span style={{ margin: '0 10px' }}>{selectedYear}</span>
        <button onClick={() => setSelectedYear(selectedYear + 1)}>Next Year</button>
      </div>

      {/* Lecturers Overloaded */}
      <section>
        <h3>Lecturers Overloaded</h3>
        {Object.entries(overloadedTerms).map(([key, term]) => (
          <div key={key} className="term-overload-section">
            <h4>{term.name}</h4>
            <table>
              <thead>
                <tr>
                  <th>Lecturer</th>
                  <th>Number of Courses</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(term.lecturers).map(([lecturer, courses]) => (
                  <React.Fragment key={lecturer}>
                    <tr>
                      <td>{lecturer}</td>
                      <td>{`${courses.length} ⚠️ Overloaded`}</td>
                    </tr>
                    {courses.map((course) => (
                      <tr key={course._id} style={{ backgroundColor: '#f8f8f8' }}>
                        <td colSpan="1"> └ {course.title}</td>
                        <td>
                          <button onClick={() => handleRemoveLecturer(course._id)}>
                            Unassign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {Object.keys(term.lecturers).length === 0 && (
                  <tr>
                    <td colSpan="2">No overloaded lecturers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </section>
  
      {/* Invalid Courses */}
      <section>
        <h3>Invalid Courses (End Date before Start Date)</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invalidCourses.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{new Date(course.startDate).toLocaleDateString()}</td>
                <td>{new Date(course.endDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => deleteInvalidCourse(course._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Control;
