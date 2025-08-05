import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register'; 
import Dashboard from './components/Dashboard';
import CreateForm from './components/CreateForm';
import PublicForm from './components/PublicForm';
import './App.css';
import { useParams } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public form route - no authentication required */}
          <Route 
            path="/form/:formId" 
            element={<PublicFormWrapper />} 
          />
          
          {/* Admin routes - authentication required */}
          <Route 
            path="/admin/*" 
            element={
              user ? (
                <AdminRoutes 
                  user={user} 
                  onLogout={handleLogout} 
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Authentication routes */}
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to="/admin" replace />
              ) : (
                <AuthComponent 
                  showRegister={showRegister}
                  setShowRegister={setShowRegister}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                />
              )
            } 
          />
          
          {/* Default route */}
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

// Component for public form access
const PublicFormWrapper = () => {
  const { formId } = useParams();
  return <PublicForm formId={formId} />;
};

// Component for admin routes
const AdminRoutes = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleCreateForm = () => {
    setCurrentView('create-form');
  };

  const handleFormCreated = (formData) => {
    console.log('Form created:', formData);
    setCurrentView('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (currentView === 'create-form') {
    return (
      <CreateForm 
        onFormCreated={handleFormCreated}
        onCancel={handleBackToDashboard}
      />
    );
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={onLogout}
      onCreateForm={handleCreateForm}
    />
  );
};

// Component for authentication
const AuthComponent = ({ showRegister, setShowRegister, onLogin, onRegister }) => {
  return (
    <>
      {showRegister ? (
        <div>
          <Register onRegister={onRegister} />
          <p style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <button onClick={() => setShowRegister(false)}>Login</button>
          </p>
        </div>
      ) : (
        <div>
          <Login onLogin={onLogin} />
          <p style={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <button onClick={() => setShowRegister(true)}>Register</button>
          </p>
        </div>
      )}
    </>
  );
};

export default App;
