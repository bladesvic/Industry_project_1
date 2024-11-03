import React, { useState } from 'react';
import axios from 'axios';

function CourseForm({ onCourseCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/courses/create`,
        { title, description, startDate, endDate, startTime, endTime, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setSuccess('Course created successfully!');
      setError('');
      onCourseCreated(response.data.course); // Trigger callback to refresh calendar
      resetForm();
    } catch (err) {
      console.error('Full error response:', err); // Log the entire error object for debugging
      setError(err.response?.data?.error || 'Failed to create course');
      setSuccess('');
    }
  };
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
  };

  return (
    <div className="course-form">
      <h3>Create a New Course</h3>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course Title" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        
        {/* Start Date and End Date */}
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        
        {/* Start Time and End Time */}
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Start Time" required />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="End Time" required />
        
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        <button type="submit">Create Course</button>
      </form>
    </div>
  );
}

export default CourseForm;
