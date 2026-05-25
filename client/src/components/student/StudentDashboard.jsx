import React, { useState } from 'react';
import './Student.css';

const StudentDashboard = ({ onStartExam }) => {
  const [availableExams] = useState([
    { id: 101, title: 'Introduction to Algorithms', duration: '60 mins' },
    { id: 102, title: 'Web Development Basics', duration: '45 mins' },
  ]);

  const [pastExams] = useState([
    { id: 50, title: 'Database Systems', grade: 92, date: '2026-05-15' },
    { id: 45, title: 'Data Structures', grade: 88, date: '2026-04-20' },
  ]);

  return (
    <div className="student-container">
      <h1>Student Portal</h1>

      <h2 className="section-title">Available Exams</h2>
      <div className="exam-list">
        {availableExams.map(exam => (
          <div key={exam.id} className="exam-item">
            <div>
              <h3>{exam.title}</h3>
              <p><small>Duration: {exam.duration}</small></p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => onStartExam(exam)}
            >
              Start Exam
            </button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Past Exams & Grades</h2>
      <div className="exam-list">
        {pastExams.map(exam => (
          <div key={exam.id} className="exam-item">
            <div>
              <h3>{exam.title}</h3>
              <p><small>Completed on: {exam.date}</small></p>
            </div>
            <div className="grade-badge">Grade: {exam.grade}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
