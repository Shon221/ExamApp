import React, { useState, useEffect } from 'react';
import mockDBService from '../../services/MockDBService';
import './Student.css';

/**
 * StudentDashboard Component - The main interface for students.
 * Fetches and displays a list of published exams available to be taken.
 */
const StudentDashboard = ({ onStartExam }) => {
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load published exams from the mock database on mount
  useEffect(() => {
    const loadExams = async () => {
      try {
        const exams = await mockDBService.getPublishedExams();
        setAvailableExams(exams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  if (loading) return <div className="student-container">Loading available exams...</div>;


  return (
    <div className="student-container">
      <header className="dashboard-header">
        <h1>Student Portal</h1>
        <p>Welcome! Select an exam below to begin.</p>
      </header>

      <div className="exams-grid">
        {availableExams.length === 0 ? (
          <div className="empty-state">No exams are currently published.</div>
        ) : (
          availableExams.map(exam => (
            <div key={exam.id} className="exam-card">
              <h3>{exam.title}</h3>
              <p className="exam-info">{exam.instructions || 'No special instructions.'}</p>
              <button 
                className="btn-primary" 
                onClick={() => onStartExam(exam.id)}
              >
                Start Exam
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;