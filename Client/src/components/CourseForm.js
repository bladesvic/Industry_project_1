import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Papa from 'papaparse';

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
  const [searchTerm, setSearchTerm] = useState(''); // Search term state
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered courses state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); // Selected date for calendar
  const [calendarApi, setCalendarApi] = useState(null); // Calendar API reference

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter courses based on search term
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  useEffect(() => {
    if (calendarApi) {
      calendarApi.gotoDate(currentDate); // Navigate calendar when the selected date changes
    }
  }, [currentDate, calendarApi]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
      setFilteredCourses(response.data);
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

  const handleAssignUser = async (courseId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/courses/update/${courseId}`,
        { assignedUser: userId },
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setCurrentDate((prevDate) => new Date(newYear, prevDate.getMonth(), 1));
  };

  return (
    <div className="course-container">
      <div className="top-row">
        {/* Course Creation Form */}
        <div className="course-form">
          <h3>Create a New Course</h3>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <form>
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
        </div>

        {/* Calendar View */}
        <div className="calendar-section">
          <div className="calendar-controls">
            <label htmlFor="month-select">Month:</label>
            <select
              id="month-select"
              value={currentDate.getMonth()}
              onChange={handleMonthChange}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {new Date(0, index).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <label htmlFor="year-select">Year:</label>
            <select
              id="year-select"
              value={currentDate.getFullYear()}
              onChange={handleYearChange}
            >
              {Array.from({ length: 10 }, (_, index) => {
                const year = new Date().getFullYear() - 5 + index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={courses.map((course) => ({
              title: course.title,
              start: course.startDate,
              end: course.endDate,
            }))}
            height="300px"
            ref={(calendar) => setCalendarApi(calendar?.getApi())}
          />
        </div>
      </div>

      {/* Bottom Row: Existing Courses Table */}
      <div className="table-section">
        <h3>Existing Courses</h3>
        <input
          type="text"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
        />
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
            {filteredCourses.map((course) => (
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
