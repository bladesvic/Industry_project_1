import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageStaff from '../components/ManageStaff';
import AssignLecturers from '../components/AssignLecturers'; // Updated import
import UserManagement from '../components/UserManagement';
import CalendarView from '../components/CalendarView';
import MySchedule from '../components/MySchedule';
import CourseForm from '../components/CourseForm';
import UserControl from '../components/UserControl';
import apiClient from '../services/apiClient';
import { jwtDecode } from 'jwt-decode';

function Dashboard() {
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState(null);

  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now(); // Check if token is expired
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || !isTokenValid(token)) {
      console.warn('Invalid or expired token. Redirecting to login.');
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await apiClient.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserEmail(response.data.email);
        setUserRole(response.data.role);
        setAuthChecked(true);
      } catch (err) {
        console.error('Error fetching user details:', err.response?.data || err.message);
        localStorage.removeItem('token');
        setError('Failed to authenticate. Redirecting to login...');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Manage Staff':
        return <ManageStaff />;
      case 'Assign Lecturers': // Updated case
        return <AssignLecturers />;
      case 'User Management':
        return <UserManagement />;
      case 'Calendar':
        return <CalendarView />;
      case 'My Schedule':
        return <MySchedule />;
      case 'Create Course':
        return <CourseForm />;
      case 'User Control':
        return <UserControl />;
      default:
        return <Welcome />;
    }
  };

  if (error) {
    return (
      <div className="error-screen">
        <h2>{error}</h2>
        <p>Please try logging in again. Redirecting to the login page...</p>
      </div>
    );
  }

  if (!authChecked) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <nav>
          {userRole === 'user' && (
            <>
              <button onClick={() => setActiveComponent('Manage Staff')}>Manage Staff</button>
              <button onClick={() => setActiveComponent('Assign Lecturers')}>Assign Lecturers</button> {/* Updated button */}
              <button onClick={() => setActiveComponent('User Management')}>User Management</button>
              <button onClick={() => setActiveComponent('Calendar')}>Calendar</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
          {userRole === 'lecturer' && (
            <>
              <button onClick={() => setActiveComponent('My Schedule')}>My Schedule</button>
              <button onClick={() => setActiveComponent('Calendar')}>Calendar</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveComponent('Manage Staff')}>Manage Staff</button>
              <button onClick={() => setActiveComponent('Assign Lecturers')}>Assign Lecturers</button> {/* Updated button */}
              <button onClick={() => setActiveComponent('User Management')}>User Management</button>
              <button onClick={() => setActiveComponent('Calendar')}>Calendar</button>
              <button onClick={() => setActiveComponent('My Schedule')}>My Schedule</button>
              <button onClick={() => setActiveComponent('Create Course')}>Create Course</button>
              <button onClick={() => setActiveComponent('User Control')}>User Control</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
        <div className="logged-in-user">
          Logged in user: <strong>{userEmail || 'Loading...'}</strong>
        </div>
      </aside>
      <main className="content">{renderComponent()}</main>
    </div>
  );
}

const Welcome = () => <div>Welcome to your dashboard!</div>;

export default Dashboard;