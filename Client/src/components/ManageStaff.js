import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageStaff() {
  const [lecturers, setLecturers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLecturers();
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

  return (
    <div className="manage-staff">
      <h2>Manage Lecturers</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="lecturer-list">
        <h3>Lecturer List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Teaching Ability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer) => (
              <tr key={lecturer._id}>
                <td>
                  <input
                    type="text"
                    defaultValue={lecturer.name}
                    onBlur={(e) => handleUpdateLecturer(lecturer._id, { name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="email"
                    defaultValue={lecturer.email}
                    onBlur={(e) => handleUpdateLecturer(lecturer._id, { email: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={lecturer.teachingAbility || 5}
                    min="1"
                    max="10"
                    onBlur={(e) =>
                      handleUpdateLecturer(lecturer._id, { teachingAbility: Number(e.target.value) })
                    }
                  />
                </td>
                <td>
                  {/* Add more actions here if needed */}
                  <button onClick={() => fetchLecturers()}>Refresh</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStaff;
