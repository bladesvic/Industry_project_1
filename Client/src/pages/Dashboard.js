import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageStaff from '../components/ManageStaff';  // Import actual component
import SchedulingRules from '../components/SchedulingRules';  // Import actual component if it exists
import AssignLecturers from '../components/AssignLecturers';  // Import actual component if it exists
import MySchedule from '../components/MySchedule';  // Import actual component if it exists

// Mock roles for demonstration; replace with real role-based data
const userRole = 'Administrator'; // Can be 'Administrator', 'Manager', or 'Lecturer'

function Dashboard() {
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState(''); // Track active component

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Manage Staff':
        return <ManageStaff />;
      case 'Scheduling Rules':
        return <SchedulingRules />;
      case 'Assign Lecturers':
        return <AssignLecturers />;
      case 'My Schedule':
        return <MySchedule />;
      // Add cases for all other components based on role
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
              <button onClick={() => setActiveComponent('User Access')}>User Access Levels</button>
            </>
          )}
          {userRole === 'Manager' && (
            <>
              <button onClick={() => setActiveComponent('Assign Lecturers')}>Assign Lecturers</button>
              <button onClick={() => setActiveComponent('Workload Overview')}>Workload Overview</button>
              <button onClick={() => setActiveComponent('Approval Requests')}>Approval Requests</button>
            </>
          )}
          {userRole === 'Lecturer' && (
            <>
              <button onClick={() => setActiveComponent('My Schedule')}>My Schedule</button>
              <button onClick={() => setActiveComponent('Request Changes')}>Request Changes</button>
              <button onClick={() => setActiveComponent('Availability')}>Set Availability</button>
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

// Placeholder component for Welcome message
const Welcome = () => <div>Welcome to your dashboard!</div>;

export default Dashboard;
