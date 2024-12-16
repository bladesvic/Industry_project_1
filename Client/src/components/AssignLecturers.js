import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AssignLecturers() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPageUnassigned, setCurrentPageUnassigned] = useState(1);
  const [currentPageAssigned, setCurrentPageAssigned] = useState(1);
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [filterMode, setFilterMode] = useState('can'); // "can" or "cannot"

  const recordsPerPage = 10;

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lecturers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLecturers(response.data);
    } catch (err) {
      console.error('Error fetching lecturers:', err);
    }
  };

  const fetchEligibleLecturers = async (courseId) => {
    try {
      setSelectedCourseId(courseId);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lecturers/available`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLecturers(response.data);
    } catch (err) {
      console.error('Error fetching eligible lecturers:', err);
      setFeedback('Failed to fetch eligible lecturers. Please try again.');
    }
  };

  const handleAssignLecturer = async (courseId, lecturerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/courses/update/${courseId}`,
        { assignedUser: lecturerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback('Lecturer successfully assigned!');
      fetchCourses();
      setSelectedCourseId(null); // Reset dropdown after assignment
    } catch (err) {
      console.error('Error assigning lecturer:', err);
      setFeedback('Failed to assign lecturer.');
    }
  };

  const handleRemoveLecturer = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/courses/update/${courseId}`,
        { assignedUser: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback('Lecturer successfully removed!');
      fetchCourses();
    } catch (err) {
      console.error('Error removing lecturer:', err);
      setFeedback('Failed to remove lecturer.');
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
    setCurrentPageUnassigned(1);
    setCurrentPageAssigned(1);
  };

  const toggleFilterMode = () => {
    setFilterMode((prev) => (prev === 'can' ? 'cannot' : 'can'));
  };

  const filteredUnassignedCourses = courses
    .filter((course) => !course.assignedUser)
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery) ||
        course.description.toLowerCase().includes(searchQuery);

      if (!selectedLecturer) return matchesSearch;

      const lecturerEligible = course.eligibleLecturers?.includes(selectedLecturer);
      return filterMode === 'can'
        ? lecturerEligible && matchesSearch
        : !lecturerEligible && matchesSearch;
    });

  const filteredAssignedCourses = courses
    .filter((course) => course.assignedUser)
    .filter((course) => course.title.toLowerCase().includes(searchQuery) || course.description.toLowerCase().includes(searchQuery));

  const unassignedCoursesToDisplay = filteredUnassignedCourses.slice(
    (currentPageUnassigned - 1) * recordsPerPage,
    currentPageUnassigned * recordsPerPage
  );

  const assignedCoursesToDisplay = filteredAssignedCourses.slice(
    (currentPageAssigned - 1) * recordsPerPage,
    currentPageAssigned * recordsPerPage
  );

  return (
    <div className="assign-lecturers-container">
      <h2>Assign Lecturers</h2>
      {feedback && <div className="feedback-message">{feedback}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
        
      </div>

      <div className="modern-table-container">
        <h3>Unassigned Courses</h3>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unassignedCoursesToDisplay.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{new Date(course.startDate).toLocaleDateString()}</td>
                <td>{new Date(course.endDate).toLocaleDateString()}</td>
                <td>
                  {selectedCourseId === course._id && lecturers.length > 0 ? (
                    <select
                      className="lecturer-dropdown"
                      onChange={(e) => handleAssignLecturer(course._id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select Lecturer
                      </option>
                      {lecturers.map((lecturer) => (
                        <option key={lecturer._id} value={lecturer._id}>
                          {lecturer.name}
                        </option>
                      ))}
                    </select>
                  ) : selectedCourseId === course._id && lecturers.length === 0 ? (
                    <span>No Available Lecturer</span>
                  ) : (
                    <button
                      className="assign-button"
                      onClick={() => fetchEligibleLecturers(course._id)}
                    >
                      Assign Lecturer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={() => setCurrentPageUnassigned((prev) => Math.max(prev - 1, 1))}
            disabled={currentPageUnassigned === 1}
          >
            Previous
          </button>
          <span>Page {currentPageUnassigned}</span>
          <button
            onClick={() =>
              setCurrentPageUnassigned((prev) =>
                prev < Math.ceil(filteredUnassignedCourses.length / recordsPerPage) ? prev + 1 : prev
              )
            }
            disabled={currentPageUnassigned >= Math.ceil(filteredUnassignedCourses.length / recordsPerPage)}
          >
            Next
          </button>
        </div>

        <h3>Assigned Courses</h3>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Assigned Lecturer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedCoursesToDisplay.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{new Date(course.startDate).toLocaleDateString()}</td>
                <td>{new Date(course.endDate).toLocaleDateString()}</td>
                <td>{course.assignedUser?.name}</td>
                <td>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveLecturer(course._id)}
                  >
                    Remove Lecturer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={() => setCurrentPageAssigned((prev) => Math.max(prev - 1, 1))}
            disabled={currentPageAssigned === 1}
          >
            Previous
          </button>
          <span>Page {currentPageAssigned}</span>
          <button
            onClick={() =>
              setCurrentPageAssigned((prev) =>
                prev < Math.ceil(filteredAssignedCourses.length / recordsPerPage) ? prev + 1 : prev
              )
            }
            disabled={currentPageAssigned >= Math.ceil(filteredAssignedCourses.length / recordsPerPage)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignLecturers;
