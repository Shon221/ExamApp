import React, { useState, useEffect } from 'react';
import NavigationMenu from './components/NavigationMenu';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ExamBuilder from './components/teacher/ExamBuilder';
import StudentDashboard from './components/student/StudentDashboard';
import authService from './services/AuthService';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    if (!currentUser) {
      setCurrentView('login');
    } else {
      setCurrentView(currentUser.role === 'lecturer' ? 'teacher-dashboard' : 'student-dashboard');
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('login');
  };

  const navigate = (view) => {
    setCurrentView(view);
  };

  const renderView = () => {
    if (!currentUser) {
      if (currentView === 'register') {
        return <Register onRegisterSuccess={handleLoginSuccess} onBackToLogin={() => navigate('login')} />;
      }
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentView) {
      case 'teacher-dashboard':
        return <TeacherDashboard onAddExam={() => navigate('create-exam')} />;
      case 'create-exam':
        return <ExamBuilder onSave={() => navigate('teacher-dashboard')} onCancel={() => navigate('teacher-dashboard')} />;
      case 'student-dashboard':
        return <StudentDashboard />;
      default:
        return currentUser.role === 'lecturer' ? <TeacherDashboard onAddExam={() => navigate('create-exam')} /> : <StudentDashboard />;
    }
  };

  return (
    <div className="min-vh-100 bg-light pb-5">
      <NavigationMenu 
        role={currentUser?.role} 
        onNavigate={navigate} 
        onLogout={handleLogout} 
      />

      <main className="container mt-4">
        {renderView()}
      </main>

      <footer className="fixed-bottom bg-dark text-white text-center py-2">
        <small>&copy; 2026 E-Test System | Integrated Architecture</small>
      </footer>
    </div>
  );
}

export default App;
