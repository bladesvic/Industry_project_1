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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarApi, setCalendarApi] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchUsers(); // Ensure fetchUsers is defined and included here
  }, []);
  
  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);
  
  useEffect(() => {
    if (calendarApi) {
      calendarApi.gotoDate(currentDate);
    }
  }, [currentDate, calendarApi]);
  
  const deleteCourse = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/courses/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Course deleted successfully.');
      fetchCourses(); // Refresh the course list after deletion
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. Please try again.');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload
  
    try {
      const token = localStorage.getItem('token');
  
      // Make the POST request to create the course
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/courses/create`,
        {
          title,
          description,
          startDate,
          endDate,
          startTime: startTime || '01:00',
          endTime: endTime || '13:00',
          location,
          assignedUser: assignedUser || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setSuccess('Course created successfully!');
      resetForm(); // Ensure resetForm is defined elsewhere
      fetchCourses(); // Refresh the course list
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course.');
    }
  };
  
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
  
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const token = localStorage.getItem("token");
        let successCount = 0;
        let failureCount = 0;
  
        for (const course of results.data) {
          try {
            if (!course.Title || !course.StartDate || !course.EndDate) {
              failureCount++;
              continue;
            }
  
            await axios.post(
              `${process.env.REACT_APP_API_URL}/api/courses/create`,
              {
                title: course.Title,
                description: course.Description || "",
                startDate: course.StartDate,
                endDate: course.EndDate,
                startTime: course.StartTime || '01:00',
                endTime: course.EndTime || '13:00',
                location: course.Location || "Unknown",
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            successCount++;
          } catch (err) {
            console.error("Failed to import course:", course, err);
            failureCount++;
          }
        }
  
        setSuccess(`${successCount} courses imported successfully.`);
        setError(failureCount > 0 ? `${failureCount} courses failed to import.` : "");
        fetchCourses(); // Refresh courses
      },
      error: (err) => setError("Error parsing CSV file."),
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };
  
  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };
  
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data); // Set the list of users in state
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
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
  <label>Start Time:</label>
  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
  <label>End Time:</label>
  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
  
  {/* Fix the button */}
  <button type="submit">Create Course</button>
</form>

          {/* CSV Upload Section */}
          <div className="csv-upload">
            <label htmlFor="csvUpload">Upload CSV:</label>
            <input type="file" id="csvUpload" accept=".csv" onChange={handleCSVUpload} />
          </div>
        </div>

        {/* Calendar View */}
        <div className="calendar-section">
          <div className="calendar-controls">
            <label>Month:</label>
            <select value={currentDate.getMonth()} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {new Date(0, index).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <label>Year:</label>
            <select value={currentDate.getFullYear()} onChange={handleYearChange}>
              {Array.from({ length: 10 }, (_, index) => {
                const year = new Date().getFullYear() - 5 + index;
                return <option key={year} value={year}>{year}</option>;
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

      {/* Existing Courses Table */}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CourseForm;