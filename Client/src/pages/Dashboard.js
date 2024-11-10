import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageStaff from '../components/ManageStaff';
import SchedulingRules from '../components/SchedulingRules';
import UserManagement from '../components/UserManagement';
import CalendarView from '../components/CalendarView';
import CourseForm from '../components/CourseForm'; 
import UserControl from '../components/UserControl'; // Import UserControl component

const userRole = 'Administrator'; // Mock role; replace with actual role from authentication

function Dashboard() {
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Check if the user is authenticated when the component mounts
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false); // Update state to trigger redirect
  };

  const handleCourseCreated = (newCourse) => {
    console.log("Course created:", newCourse);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Manage Staff':
        return <ManageStaff />;
      case 'Scheduling Rules':
        return <SchedulingRules />;
      case 'User Management':
        return <UserManagement />;
      case 'Calendar':
        return <CalendarView />;
      case 'Create Course':
        return <CourseForm onCourseCreated={handleCourseCreated} />;
      case 'User Control':
        return <UserControl />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <nav>
          {userRole === 'Administrator' && (
            <>
              <button onClick={() => setActiveComponent('Manage Staff')}>Manage Staff</button>
              <button onClick={() => setActiveComponent('Scheduling Rules')}>Scheduling Rules</button>
              <button onClick={() => setActiveComponent('User Management')}>User Management</button>
              <button onClick={() => setActiveComponent('Calendar')}>Calendar</button>
              <button onClick={() => setActiveComponent('Create Course')}>Create Course</button>
              <button onClick={() => setActiveComponent('User Control')}>User Control</button>
            </>
          )}
        </nav>
        <button onClick={handleLogout}>Logout</button>
      </aside>
      <main className="content">
        {renderComponent()}
      </main>
    </div>
  );
}

const Welcome = () => <div>Welcome to your dashboard!</div>;

export default Dashboard;

