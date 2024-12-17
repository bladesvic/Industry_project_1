import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageStaff() {
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]); // All courses
  const [assignedCourses, setAssignedCourses] = useState([]); // Courses for the selected lecturer
  const [selectedLecturer, setSelectedLecturer] = useState(null); // Currently selected lecturer
  const [searchQuery, setSearchQuery] = useState(''); // Search query for lecturers
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchLecturers();
    fetchCourses();
  }, []);

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLecturers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching lecturers:', err);
      setError('Failed to load lecturers');
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const validCourses = response.data.filter((course) => {
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        return startDate <= endDate; // Ensure valid courses
      });

      setCourses(validCourses);
      setError('');
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    }
  };

  const handleViewCourses = (lecturerId) => {
    const lecturer = lecturers.find((lect) => lect._id === lecturerId);
    setSelectedLecturer(lecturer);

    const filteredCourses = courses.filter((course) => {
      const courseYear = new Date(course.startDate).getFullYear();
      return (
        course.assignedUser?._id === lecturerId && courseYear === year
      );
    });
    setAssignedCourses(filteredCourses);
  };

  const handleYearChange = (change) => {
    const newYear = year + change;
    setYear(newYear);

    if (selectedLecturer) {
      handleViewCourses(selectedLecturer._id); // Reload courses for the selected lecturer
    }
  };

  // Group courses into terms
  const groupCoursesByTerm = (courses) => {
    const term1 = courses.filter((course) => isInTerm(course, `${year}-02-01`, `${year}-04-30`));
    const term2 = courses.filter((course) => isInTerm(course, `${year}-05-01`, `${year}-07-31`));
    const term3 = courses.filter((course) => isInTerm(course, `${year}-08-01`, `${year}-10-31`));
    const term4 = courses.filter((course) => isInTerm(course, `${year}-11-01`, `${year + 1}-01-31`));

    return { term1, term2, term3, term4 };
  };

  const isInTerm = (course, start, end) => {
    const courseStart = new Date(course.startDate);
    const courseEnd = new Date(course.endDate);
    return courseStart <= new Date(end) && courseEnd >= new Date(start);
  };

  const checkOverload = (termCourses) => {
    return termCourses.length > 2 ? '⚠️ Overloaded Term' : '';
  };

  const { term1, term2, term3, term4 } = groupCoursesByTerm(assignedCourses);

  return (
    <div className="schedule-container">
      <h2>Manage Lecturers</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Search Bar */}
      <div className="table-header">
        <input
          type="text"
          placeholder="Search by lecturer name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
      </div>

      {/* Lecturer List Table */}
      <div className="lecturer-table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers
              .filter((lecturer) =>
                lecturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lecturer.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((lecturer) => (
                <tr key={lecturer._id}>
                  <td>{lecturer.name}</td>
                  <td>{lecturer.email}</td>
                  <td>
                    <button
                      onClick={() => handleViewCourses(lecturer._id)}
                      className="view-courses-button"
                    >
                      View Courses
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Year Navigation */}
      <div className="year-navigation">
        <button onClick={() => handleYearChange(-1)} className="year-button">
          Previous Year
        </button>
        <h3>{year}</h3>
        <button onClick={() => handleYearChange(1)} className="year-button">
          Next Year
        </button>
      </div>

      {/* Courses Table */}
      {selectedLecturer && (
        <div className="courses-table-container">
          <h3>Courses Assigned to {selectedLecturer.name} ({year})</h3>

          {[
            { term: 'Term 1: Feb - Apr', courses: term1 },
            { term: 'Term 2: May - Jul', courses: term2 },
            { term: 'Term 3: Aug - Oct', courses: term3 },
            { term: 'Term 4: Nov - Jan', courses: term4 },
          ].map(({ term, courses }, idx) => (
            <div key={idx} className="term-section">
              <h4>
                {term} {checkOverload(courses)}
              </h4>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <tr key={course._id}>
                        <td>{course.title}</td>
                        <td>{course.description}</td>
                        <td>{new Date(course.startDate).toLocaleDateString()}</td>
                        <td>{new Date(course.endDate).toLocaleDateString()}</td>
                        <td>{selectedLecturer.name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No courses available for this term.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageStaff;

