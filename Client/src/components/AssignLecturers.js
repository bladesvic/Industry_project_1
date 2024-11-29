import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AssignLecturers() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    fetchCourses();
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
      console.error('Error fetching lecturers:', err);
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

  return (
    <div className="assign-lecturers-container">
      <h2>Assign Lecturers</h2>
      {feedback && <div className="feedback-message">{feedback}</div>}
      <div className="modern-table-container">
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
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{new Date(course.startDate).toLocaleDateString()}</td>
                <td>{new Date(course.endDate).toLocaleDateString()}</td>
                <td>{course.assignedUser?.name || 'Unassigned'}</td>
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
      </div>
    </div>
  );
}

export default AssignLecturers;
