import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Help() {
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [courses, setCourses] = useState([]); // State to store courses
  const [error, setError] = useState('');

  useEffect(() => {
    // Decode user name and userId from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name); // Extract the user's name from the token
        setUserId(decoded.userId); // Extract the userId from the token
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch all courses assigned to the logged-in user after the year 9000
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/courses/mine`, // Endpoint to fetch user's courses
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Filter courses where startDate is after the year 9000
        const filteredCourses = response.data.filter((course) => {
          return new Date(course.startDate) > new Date('9000-01-01');
        });

        setCourses(filteredCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to fetch courses.');
      }
    };

    if (userId) fetchCourses();
  }, [userId]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentDateTime = new Date().toLocaleString(); // Get current date/time

      // Set start and end times to 1 AM and 1 PM
      const startTime = '01:00';
      const endTime = '13:00';

      // Log the request data being sent
      console.log('Sending help request with data:', {
        title: `Unavailable (${userName})`,
        description: `${description} (Message ${currentDateTime})`,
        startDate: '9999-01-01',
        endDate: '9999-01-02',
        startTime,
        endTime,
        assignedUser: userId,
      });

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/courses/create`,
        {
          title: `Unavailable (${userName})`,
          description: `${description} (Message ${currentDateTime})`,
          startDate: '9999-01-01',
          endDate: '9999-01-02',
          startTime,
          endTime,
          assignedUser: userId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback('Help request submitted successfully!');
      setDescription('');
    } catch (err) {
      console.error('Error submitting help request:', err);
      setFeedback('Failed to submit help request.');
    }
  };

  return (
    <div className="help-container">
      <h2>Help Request</h2>
      <p>
        If you are experiencing issues, please describe your problem below. Your message will be sent to the manager.
      </p>
      <textarea
        placeholder="Describe your issue here..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="help-textarea"
      ></textarea>
      <br />
      <button onClick={handleSubmit} className="help-submit-button">
        Submit Help Request
      </button>
      {feedback && <p className="feedback-message">{feedback}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Table of courses assigned to the user after year 9000 */}
      <div className="courses-table">
        <h3>Open Help Requests</h3>
        {courses.length > 0 ? (
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                
                <th>Description</th>
             
          
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                 
                  <td>{course.description}</td>
              
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No courses found after the year 9000.</p>
        )}
      </div>
    </div>
  );
}

export default Help;
