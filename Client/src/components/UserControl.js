import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; // Import PapaParse for CSV parsing

function UserControl() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [teachingAbility, setTeachingAbility] = useState(5);
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
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/create`,
        { name, email, password, role, teachingAbility: role === 'lecturer' ? teachingAbility : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('User created successfully');
      setError('');
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError('No file selected.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const token = localStorage.getItem('token');
        let successCount = 0;
        let failureCount = 0;

        for (const user of results.data) {
          try {
            if (!user.Name || !user.Email || !user.Password || !user.Role) {
              failureCount++;
              continue;
            }

            await axios.post(
              `${process.env.REACT_APP_API_URL}/api/auth/create`,
              {
                name: user.Name,
                email: user.Email,
                password: user.Password,
                role: user.Role,
                teachingAbility: user.Role === 'lecturer' ? user.TeachingAbility || 5 : null,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            successCount++;
          } catch (err) {
            console.error('Failed to create user:', user, err);
            failureCount++;
          }
        }

        setSuccess(`${successCount} users created successfully.`);
        setError(failureCount > 0 ? `${failureCount} users failed to create.` : '');
        fetchUsers();
      },
      error: (err) => {
        console.error('Error parsing CSV:', err);
        setError('Error parsing CSV file.');
      },
    });
  };

  const handleUpdateUser = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/update/${id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('User updated successfully');
      setError('');
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
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
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setTeachingAbility(5);
  };

  return (
    <div className="user-control">
      <h2>User Management</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="create-user">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value !== 'lecturer') setTeachingAbility(5);
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="lecturer">Lecturer</option>
          </select>
          {role === 'lecturer' && (
            <input
              type="number"
              value={teachingAbility}
              onChange={(e) => setTeachingAbility(Number(e.target.value))}
              placeholder="Teaching Ability (1-10)"
              min="1"
              max="10"
              required
            />
          )}
          <button type="submit">Create User</button>
        </form>

        {/* CSV Upload Section */}
        <div className="csv-upload">
          <h3>Upload Users via CSV</h3>
          <input type="file" accept=".csv" onChange={handleCSVUpload} />
        </div>
      </div>

      <div className="user-list">
        <h3>Existing Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Teaching Ability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <input
                    type="text"
                    defaultValue={user.name}
                    onBlur={(e) => handleUpdateUser(user._id, { name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="email"
                    defaultValue={user.email}
                    onBlur={(e) => handleUpdateUser(user._id, { email: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    defaultValue={user.role}
                    onChange={(e) =>
                      handleUpdateUser(user._id, {
                        role: e.target.value,
                        teachingAbility: e.target.value === 'lecturer' ? user.teachingAbility : null,
                      })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="lecturer">Lecturer</option>
                  </select>
                </td>
                <td>
                  {user.role === 'lecturer' && (
                    <input
                      type="number"
                      defaultValue={user.teachingAbility || 5}
                      min="1"
                      max="10"
                      onBlur={(e) =>
                        handleUpdateUser(user._id, { teachingAbility: Number(e.target.value) })
                      }
                    />
                  )}
                </td>
                <td>
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
