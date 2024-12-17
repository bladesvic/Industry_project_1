import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState({});
  const [warning, setWarning] = useState('');

  useEffect(() => {
    const fetchUserDetails = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId);
          setUserName(decoded.name || 'Lecturer');
        } catch (err) {
          console.error('Error decoding token:', err);
          setError('Failed to authenticate user.');
        }
      }
    };

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(Array.isArray(response.data) ? response.data : []);
        setError('');
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      }
    };

    fetchUserDetails();
    fetchCourses();
  }, []);

  const termDates = {
    term1: { start: `${year}-02-01`, end: `${year}-04-30` },
    term2: { start: `${year}-05-01`, end: `${year}-07-31` },
    term3: { start: `${year}-08-01`, end: `${year}-10-31` },
    term4: { start: `${year}-11-01`, end: `${year + 1}-01-31` },
  };

  const filterByTerm = (termStart, termEnd) => {
    return courses.filter((course) => {
      const courseStart = new Date(course.startDate);
      const courseEnd = new Date(course.endDate);
      const termStartDate = new Date(termStart);
      const termEndDate = new Date(termEnd);
      return courseStart <= termEndDate && courseEnd >= termStartDate;
    });
  };

  const countTermCourses = (termStart, termEnd) => filterByTerm(termStart, termEnd).length;

  const handleMarkUnavailable = (termStart, termEnd) => {
    setConfirmDetails({ termStart, termEnd });
    setShowConfirm(true);
  };

  const confirmMarkUnavailable = async () => {
    const { termStart, termEnd } = confirmDetails;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/courses/create`,
        {
          title: `Unavailable ${userName}`,
          description: 'Lecturer marked as unavailable.',
          startDate: termStart,
          endDate: termEnd,
          assignedUser: userId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback('Marked as unavailable for the selected term.');
      setCourses((prevCourses) => [...prevCourses, response.data]);
      setWarning('');
      setShowConfirm(false);
    } catch (err) {
      console.error('Error marking unavailable:', err);
      setFeedback('Failed to mark yourself as unavailable.');
    }
  };

  const renderTable = (termTitle, termStart, termEnd) => {
    const termCourses = filterByTerm(termStart, termEnd);
    const courseCount = termCourses.length;

    return (
      <div className="term-table">
        <h3>{termTitle} ({courseCount}/2)</h3>
        <button
          className="mark-unavailable-button"
          onClick={() => handleMarkUnavailable(termStart, termEnd)}
          disabled={courseCount >= 2}
        >
          Mark Unavailable ({courseCount}/2)
        </button>
        {courseCount >= 3 && <p className="warning">Course conflict! Manager informed.</p>}
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {termCourses.length > 0 ? (
              termCourses.map((course) => (
                <tr key={course._id}>
                  <td>{course.title}</td>
                  <td>{course.description}</td>
                  <td>{new Date(course.startDate).toLocaleDateString()}</td>
                  <td>{new Date(course.endDate).toLocaleDateString()}</td>
                  <td>{course.location}</td>
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
    );
  };

  return (
    <div className="dashboard">
      <h2>Dashboard: Assigned Course Schedule</h2>
      {error && <p className="error">{error}</p>}
      {feedback && <p className="success">{feedback}</p>}

      <div className="year-navigation">
        <button onClick={() => setYear((prev) => prev - 1)}>Previous Year</button>
        <h3>{year}</h3>
        <button onClick={() => setYear((prev) => prev + 1)}>Next Year</button>
      </div>

      <div className="term-sections">
        {renderTable('Term 1: February - April', termDates.term1.start, termDates.term1.end)}
        {renderTable('Term 2: May - July', termDates.term2.start, termDates.term2.end)}
        {renderTable('Term 3: August - October', termDates.term3.start, termDates.term3.end)}
        {renderTable('Term 4: November - January', termDates.term4.start, termDates.term4.end)}
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="popup">
          <div className="popup-content">
            <p>Are you sure you want to mark yourself unavailable for this term?</p>
            <button onClick={confirmMarkUnavailable}>Yes</button>
            <button onClick={() => setShowConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {warning && <p className="warning">{warning}</p>}
    </div>
  );
}

export default Dashboard;
