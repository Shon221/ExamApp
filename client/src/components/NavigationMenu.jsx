import React from 'react';
import './NavigationMenu.css';

// תפריט ניווט - מציג קישורים שונים בהתאם לתפקיד המשתמש
const NavigationMenu = ({ role, onNavigate, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => onNavigate('home')}>
        ExamApp
      </div>

      <div className="navbar-links">
        {/* קישורים לאתר - התנתקים/אורחים */}
        {!role && (
          <>
            <button className="nav-link" onClick={() => onNavigate('login')}>
              Login
            </button>
            <button className="nav-link" onClick={() => onNavigate('register')}>
              Register
            </button>
          </>
        )}

        {/* קישורים למרצים */}
        {role === 'lecturer' && (
          <>
            <button className="nav-link" onClick={() => onNavigate('teacher-dashboard')}>
              Teacher Dashboard
            </button>
            <button className="nav-link" onClick={() => onNavigate('create-exam')}>
              Create Exam
            </button>
            <button className="nav-link btn-logout" onClick={onLogout}>
              Logout
            </button>
          </>
        )}

        {/* קישורים לסטודנטים */}
        {role === 'student' && (
          <>
            <button className="nav-link" onClick={() => onNavigate('student-dashboard')}>
              Student Dashboard
            </button>
            <button className="nav-link btn-logout" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationMenu;
