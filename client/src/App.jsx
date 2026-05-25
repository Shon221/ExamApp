import React, { useState } from 'react';
import Login from './components/auth/Login';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import './App.css';

function App() {
  const [view, setView] = useState('login'); // 'login', 'teacher', or 'student'

  return (
    <div className="min-vh-100 bg-light pb-5">
      <nav className="navbar navbar-dark bg-dark mb-4 px-4 shadow-sm">
        <span className="navbar-brand mb-0 h1" onClick={() => setView('login')} style={{ cursor: 'pointer' }}>
          E-Test System
        </span>
        <div className="d-flex align-items-center">
          <div className="btn-group">
            <button
              className={`btn btn-sm ${view === 'login' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setView('login')}
            >
              Login View
            </button>
            <button
              className={`btn btn-sm ${view === 'teacher' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setView('teacher')}
            >
              Teacher View
            </button>
            <button
              className={`btn btn-sm ${view === 'student' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setView('student')}
            >
              Student View
            </button>
          </div>
        </div>
      </nav>

      <main>
        {view === 'login' && <Login />}
        {view === 'teacher' && <TeacherDashboard />}
        {view === 'student' && <StudentPortal />}
      </main>

      <footer className="fixed-bottom bg-dark text-white text-center py-2">
        <small>&copy; 2026 E-Test System | Multi-view Prototype</small>
      </footer>
    </div>
  );
}

export default App;
