import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageStaff from '../components/ManageStaff';
import SchedulingRules from '../components/SchedulingRules';
import UserManagement from '../components/UserManagement'; // Import the new component

const userRole = 'Administrator'; // Mock role; replace with actual role from authentication

function Dashboard() {
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('');

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
      case 'User Management':
        return <UserManagement />; // Add the UserManagement component here
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
              <button onClick={() => setActiveComponent('User Access')}>User Access Levels</button>
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
