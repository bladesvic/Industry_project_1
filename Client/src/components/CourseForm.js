import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Papa from 'papaparse'; // Import papaparse

function CourseForm({ onCourseCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/courses/create`,
        { title, description, startDate, endDate, startTime, endTime, location, assignedUser: assignedUser || null },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess('Course created successfully!');
      setError('');
      fetchCourses();
      onCourseCreated(response.data.course);
      resetForm();
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.error || 'Failed to create course');
      setSuccess('');
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedData = results.data;
        const token = localStorage.getItem('token');

        try {
          for (const course of parsedData) {
            await axios.post(
              `${process.env.REACT_APP_API_URL}/api/courses/create`,
              {
                title: course.title,
                description: course.description,
                startDate: course.startDate,
                endDate: course.endDate,
                startTime: course.startTime,
                endTime: course.endTime,
                location: course.location,
                assignedUser: course.assignedUser || null,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
          setSuccess('Courses imported successfully!');
          fetchCourses();
        } catch (err) {
          console.error('Error importing courses:', err);
          setError('Failed to import courses');
        }
      },
      error: (err) => {
        console.error('CSV parsing error:', err);
        setError('Error parsing CSV file');
      },
    });
  };

  const handleAssignUser = async (courseId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/courses/update/${courseId}`,
        { assignedUser: userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess(response.data.message);
      fetchCourses();
    } catch (err) {
      console.error('Error assigning user:', err);
      setError('Failed to assign user');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/courses/delete/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Course deleted successfully!');
      fetchCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
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
    setAssignedUser('');
  };

  return (
    <div className="course-container">
      <div className="top-row">
        {/* Course Creation Form */}
        <div className="course-form">
          <h3>Create a New Course</h3>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <form onSubmit={handleSubmit}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course Title" required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <label>Start Date:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <label>End Date:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Start Time" required />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="End Time" required />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
            <button type="submit">Create Course</button>
          </form>
          <div className="csv-upload">
            <label htmlFor="csvUpload">Upload CSV:</label>
            <input type="file" id="csvUpload" accept=".csv" onChange={handleCSVUpload} />
          </div>
        </div>

        {/* Calendar View */}
        <div className="calendar-section">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={courses.map((course) => ({
              title: course.title,
              start: course.startDate,
              end: course.endDate,
            }))}
            height="300px"
          />
        </div>
      </div>

      {/* Bottom Row: Existing Courses Table */}
      <div className="table-section">
        <h3>Existing Courses</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Location</th>
              <th>Assigned Lecturer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{course.startDate}</td>
                <td>{course.endDate}</td>
                <td>{course.location}</td>
                <td>
                  <select
                    value={course.assignedUser ? course.assignedUser._id : ''}
                    onChange={(e) => handleAssignUser(course._id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="button-delete" onClick={() => handleDeleteCourse(course._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CourseForm;
