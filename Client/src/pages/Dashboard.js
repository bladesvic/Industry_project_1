import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageStaff from '../components/ManageStaff';
import SchedulingRules from '../components/SchedulingRules';
import UserManagement from '../components/UserManagement';
import CalendarView from '../components/CalendarView';
import CourseForm from '../components/CourseForm'; // Import CourseForm

const userRole = 'Administrator'; // Mock role; replace with actual role from authentication

function Dashboard() {
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCourseCreated = (newCourse) => {
    // Refresh calendar or handle any necessary updates after course creation
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
      case 'Create Course': // Add case for Create Course
        return <CourseForm onCourseCreated={handleCourseCreated} />;
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
              <button onClick={() => setActiveComponent('Create Course')}>Create Course</button> {/* Add Create Course button */}
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
