// UserControl.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserControl() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    console.log("Sending data:", { name, email, password, role });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/create`,
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response data:", response.data);
      setSuccess(response.data.message);
      setError('');
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    }
  };
  

  const handleUpdateRole = async (id, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/update/${id}`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message);
      setError('');
      fetchUsers();
      clearMessageAfterDelay();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
      setSuccess('');
      clearMessageAfterDelay();
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User deleted successfully');
      setError('');
      fetchUsers();
      clearMessageAfterDelay();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      setSuccess('');
      clearMessageAfterDelay();
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  return (
    <div className="user-control">
      <h2>User Management</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="create-user">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Create User</button>
        </form>
      </div>

      <div className="user-list">
        <h3>Existing Users</h3>
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
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserControl;
