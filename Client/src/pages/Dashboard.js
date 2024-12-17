import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageStaff from '../components/ManageStaff';
import AssignLecturers from '../components/AssignLecturers';
import UserManagement from '../components/UserManagement';
import CalendarView from '../components/CalendarView';
import MySchedule from '../components/MySchedule';
import CourseForm from '../components/CourseForm';
import UserControl from '../components/UserControl';
import Help from '../components/Help'; // Import the Help component
import apiClient from '../services/apiClient';
import Control from '../components/Control'; // Import Control component
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
      return decoded.exp * 1000 > Date.now();
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
        const role = response.data.role;

        setUserEmail(response.data.email);
        setUserRole(role);
        setAuthChecked(true);

        // Set default active component based on role
        if (role === 'user') {
          setActiveComponent('Manage Staff');
        } else if (role === 'lecturer') {
          setActiveComponent('My Schedule');
        }
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
      case 'Assign Lecturers':
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
      case 'Help': // Help component added
        return <Help />;
      case 'Control':
        return <Control />; // Add this case
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
              <button onClick={() => setActiveComponent('Assign Lecturers')}>Assign Lecturers</button>
              <button onClick={() => setActiveComponent('Control')}>Control</button> {/* New Control Page */}
              <button onClick={() => setActiveComponent('Calendar')}>Calendar</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
          {userRole === 'lecturer' && (
            <>
              <button onClick={() => setActiveComponent('My Schedule')}>My Schedule</button>
              <button onClick={() => setActiveComponent('Calendar')}>Calendar</button>
              
              <button onClick={() => setActiveComponent('User Management')}>User Management</button>
              <button onClick={() => setActiveComponent('Help')}>Help</button> {/* Help Button */}
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveComponent('Manage Staff')}>Manage Staff</button>
              <button onClick={() => setActiveComponent('Assign Lecturers')}>Assign Lecturers</button>
              <button onClick={() => setActiveComponent('User Management')}>User Management</button>
              <button onClick={() => setActiveComponent('Control')}>Control</button> {/* New Control Page */}
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
