import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const [teachingAbility, setTeachingAbility] = useState(5); // Default teaching ability for lecturers
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload for registration
      const payload = {
        email,
        password,
        name,
        role,
      };
      if (role === 'lecturer') {
        payload.teachingAbility = teachingAbility; // Add teaching ability only for lecturers
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, payload);
      
      // Save the token to localStorage
      localStorage.setItem('token', response.data.token);
      setSuccess('Registration successful! Redirecting to dashboard...');
      setError('');
      
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to the dashboard after registration
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err.response || err); // Log detailed error information
      setError(err.response?.data?.error || 'Error: Could not register');
      setSuccess('');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="lecturer">Lecturer</option>
        </select>

        {role === 'lecturer' && (
          <div>
            <label>Teaching Ability (1-10):</label>
            <input
              type="number"
              min="1"
              max="10"
              value={teachingAbility}
              onChange={(e) => setTeachingAbility(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit">Register</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
}

export default Register;
