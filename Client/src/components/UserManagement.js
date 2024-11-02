import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (err) {
        setError('Could not fetch users. Please try again later.');
      }
    };
    fetchUsers();
  }, []);

  const promoteToAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/promote/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: 'admin' } : user
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not promote user to admin.');
    }
  };

  return (
    <div className="user-management">
      <h2>Registered Users</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.role !== 'admin' && (
                  <button onClick={() => promoteToAdmin(user._id)}>Promote to Admin</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;