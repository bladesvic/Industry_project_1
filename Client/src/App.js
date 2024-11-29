import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

// Create a Context for Authentication State
const AuthContext = createContext();

// Custom hook to use AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Check for token on app load
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Update auth state
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token'); // Clear token
    setIsAuthenticated(false);
    window.location.href = '/login'; // Redirect to login immediately
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <Router>
        <Routes>
          {/* Redirect to dashboard if authenticated, else to login */}
          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />

          {/* Login Route */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

          {/* Register Route */}
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
