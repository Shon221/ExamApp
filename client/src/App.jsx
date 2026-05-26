import React, { useState, useEffect } from 'react';
import NavigationMenu from './components/NavigationMenu';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ExamBuilder from './components/teacher/ExamBuilder';
import StudentDashboard from './components/student/StudentDashboard';
import ExamTaker from './components/student/ExamTaker';
import ExamResults from './components/student/ExamResults';
import authService from './services/AuthService';
import './App.css';

/**
 * App Component - The root of the application.
 * Manages the global authentication state and dynamic routing/view rendering.
 */
function App() {
  // Global state for the currently authenticated user.
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  // State for the currently active view/page in the application.
  const [currentView, setCurrentView] = useState('home');
  // State for the exam being edited (for teachers).
  const [editingExamId, setEditingExamId] = useState(null);
  // State for the exam being taken (for students).
  const [takingExamId, setTakingExamId] = useState(null);
  // State for the result of a completed exam.
  const [examResult, setExamResult] = useState(null);

  /**
   * Effect hook to synchronize the view with the authentication state.
   * Redirects to login if unauthenticated, or the appropriate dashboard if logged in.
   */
  useEffect(() => {
    if (!currentUser) {
      setCurrentView('login');
    } else {
      // Role-based redirection logic.
      setCurrentView(currentUser.role === 'lecturer' ? 'teacher-dashboard' : 'student-dashboard');
    }
  }, [currentUser]);

  /**
   * Callback for successful login or registration.
   * @param {Object} user - The authenticated user object.
   */
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  /**
   * Handles user logout by clearing the session and resetting the state.
   */
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('login');
  };

  /**
   * Navigation helper to switch views and reset relevant states.
   * @param {string} view - The name of the view to navigate to.
   */
  const navigate = (view) => {
    if (view !== 'edit-exam') setEditingExamId(null);
    if (view !== 'exam-taker') setTakingExamId(null);
    setCurrentView(view);
  };

  /**
   * Dynamically renders the appropriate component based on the current view and auth state.
   * @returns {JSX.Element} The component to be rendered.
   */
  const renderView = () => {
    // Guest (Unauthenticated) views.
    if (!currentUser) {
      if (currentView === 'register') {
        return <Register onRegisterSuccess={handleLoginSuccess} onBackToLogin={() => navigate('login')} />;
      }
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Authenticated views based on the currentView state.
    switch (currentView) {
      case 'teacher-dashboard':
        return (
          <TeacherDashboard 
            onAddExam={() => navigate('create-exam')} 
            onEditExam={(id) => {
              setEditingExamId(id);
              navigate('edit-exam');
            }}
          />
        );
      case 'create-exam':
      case 'edit-exam':
        return (
          <ExamBuilder 
            examId={editingExamId}
            onSave={() => navigate('teacher-dashboard')} 
            onCancel={() => navigate('teacher-dashboard')} 
          />
        );
      case 'student-dashboard':
        return (
          <StudentDashboard 
            onStartExam={(id) => {
              setTakingExamId(id);
              navigate('exam-taker');
            }} 
          />
        );
      case 'exam-taker':
        return (
          <ExamTaker 
            examId={takingExamId} 
            onFinish={(result) => {
              setExamResult(result);
              navigate('exam-results');
            }} 
          />
        );
      case 'exam-results':
        return (
          <ExamResults 
            score={examResult?.score} 
            feedback={examResult?.feedback} 
            onBackToDashboard={() => navigate('student-dashboard')} 
          />
        );
      default:
        // Default fallback to role-specific dashboard.
        return currentUser.role === 'lecturer' ? (
          <TeacherDashboard onAddExam={() => navigate('create-exam')} onEditExam={(id) => { setEditingExamId(id); navigate('edit-exam'); }} />
        ) : (
          <StudentDashboard onStartExam={(id) => { setTakingExamId(id); navigate('exam-taker'); }} />
        );
    }
  };

  return (
    <div className="min-vh-100 bg-light pb-5">
      {/* Dynamic, role-based navigation menu */}
      <NavigationMenu 
        role={currentUser?.role} 
        onNavigate={navigate} 
        onLogout={handleLogout} 
      />

      <main className="container mt-4">
        {/* Main content area where views are injected */}
        {renderView()}
      </main>

      {/* Shared application footer */}
      <footer className="fixed-bottom bg-dark text-white text-center py-2">
        <small>&copy; 2026 E-Test System | Integrated Architecture</small>
      </footer>
    </div>
  );
}

export default App;
