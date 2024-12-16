import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageStaff() {
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]); // All courses
  const [assignedCourses, setAssignedCourses] = useState([]); // Courses for the selected lecturer
  const [selectedLecturer, setSelectedLecturer] = useState(null); // Currently selected lecturer
  const [searchQuery, setSearchQuery] = useState(''); // Search query for lecturers
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const recordsPerPage = 10; // Number of records to display per page

  // Fetch lecturers and courses on component load
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

      const formattedCourses = response.data.map((course) => ({
        id: course._id,
        title: course.title,
        startDate: course.startDate,
        endDate: course.endDate,
        description: course.description,
        location: course.location,
        assignedUser: course.assignedUser ? course.assignedUser : null,
      }));
      setCourses(formattedCourses);
      setError('');
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    }
  };

  const handleViewCourses = (lecturerId) => {
    const lecturer = lecturers.find((lect) => lect._id === lecturerId);
    setSelectedLecturer(lecturer);

    // Filter courses assigned to the selected lecturer
    const filteredCourses = courses.filter(
      (course) => course.assignedUser && course.assignedUser._id === lecturerId
    );
    setAssignedCourses(filteredCourses);
  };

  const handleUpdateLecturer = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/update/${id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message);
      setError('');
      fetchLecturers();
    } catch (err) {
      console.error('Error updating lecturer:', err);
      setError('Failed to update lecturer');
    }
  };

  // Filter lecturers based on search query
  const filteredLecturers = lecturers.filter(
    (lecturer) =>
      lecturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination indices
  const totalPages = Math.ceil(filteredLecturers.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentLecturers = filteredLecturers.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  return (
    <div className="MS-manage-staff">
      <h2>Manage Lecturers</h2>
      {error && <p className="MS-error">{error}</p>}
      {success && <p className="MS-success">{success}</p>}

      <div className="MS-lecturer-search">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="MS-search-input"
        />
      </div>

      <div className="MS-lecturer-list">
        <h3>Lecturer List</h3>
        <table className="MS-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Max Courses Per Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLecturers.map((lecturer) => {
              const lecturerCourses = courses.filter(
                (course) => course.assignedUser && course.assignedUser._id === lecturer._id
              );

              const isOverCap = lecturerCourses.length > lecturer.teachingAbility;

              return (
                <tr key={lecturer._id}>
                  <td>
                    <input
                      type="text"
                      defaultValue={lecturer.name}
                      className="MS-input"
                      onBlur={(e) =>
                        handleUpdateLecturer(lecturer._id, { name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      defaultValue={lecturer.email}
                      className="MS-input"
                      onBlur={(e) =>
                        handleUpdateLecturer(lecturer._id, { email: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      defaultValue={lecturer.teachingAbility || 5}
                      className="MS-input"
                      min="1"
                      max="10"
                      onBlur={(e) => {
                        const newTeachingAbility = Number(e.target.value);
                        if (newTeachingAbility !== lecturer.teachingAbility) {
                          handleUpdateLecturer(lecturer._id, {
                            teachingAbility: newTeachingAbility,
                          });
                        }
                      }}
                    />
                    {isOverCap && (
                      <p className="MS-error">
                        Over teaching cap! Assigned: {lecturerCourses.length}, Max: {lecturer.teachingAbility}
                      </p>
                    )}
                  </td>
                  <td>
                    <button
                      className="MS-button"
                      onClick={() => handleViewCourses(lecturer._id)}
                    >
                      View Courses
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="MS-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </div>

      {selectedLecturer && (
        <div className="MS-assigned-courses">
          <h3>Courses Assigned to {selectedLecturer.name}</h3>
          <table className="MS-table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {assignedCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.description}</td>
                  <td>{new Date(course.startDate).toLocaleDateString()}</td>
                  <td>{new Date(course.endDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageStaff;
