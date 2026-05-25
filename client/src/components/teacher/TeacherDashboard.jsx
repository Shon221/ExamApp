import React, { useState } from 'react';
import './Teacher.css';

const TeacherDashboard = ({ onAddExam }) => {
  // רשימת בחינות קיימות להצגה בלוח המנהלים
  const [exams] = useState([
    { id: 1, title: 'Final Math Exam', status: 'Published' },
    { id: 2, title: 'Midterm Science', status: 'Draft' },
  ]);

  return (
    <div className="teacher-container">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <button className="btn-primary" onClick={onAddExam}>
          + Create New Exam
        </button>
      </div>

      <div className="exams-grid">
        {exams.map(exam => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>
            <span className={`status-badge status-${exam.status.toLowerCase()}`}>
              {exam.status}
            </span>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn-secondary">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
