import React, { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import './App.css';

function App() {
  // ברירת המחדל היא 'teacher'
  const [role, setRole] = useState('teacher'); // 'teacher' or 'student'

  const toggleRole = () => {
    // שימוש ב-Callback כדי להבטיח שאנחנו מתבססים על המצב הקודם הכי עדכני
    setRole(prevRole => (prevRole === 'teacher' ? 'student' : 'teacher'));
  };

  return (
    <div className="min-vh-100 bg-light pb-5">
      <nav className="navbar navbar-dark bg-dark mb-4 px-4 shadow-sm">
        <span className="navbar-brand mb-0 h1">E-Test System</span>
        <div className="d-flex align-items-center">
          <span className="text-white me-3">Viewing as: <strong>{role === 'teacher' ? 'Teacher' : 'Student'}</strong></span>
          <button className="btn btn-outline-warning" onClick={toggleRole}>
            Switch to {role === 'teacher' ? 'Student' : 'Teacher'} Role
          </button>
        </div>
      </nav>

      <main>
        {role === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentPortal />
        )}
      </main>

      <footer className="fixed-bottom bg-dark text-white text-center py-2">
        <small>&copy; 2026 E-Test System | Prepared for Backend Integration</small>
      </footer>
    </div>
  );
}

export default App;
