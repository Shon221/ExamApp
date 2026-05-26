import React, { useState, useEffect } from 'react';
import mockDBService from '../../services/MockDBService';
import './Teacher.css';

/**
 * TeacherDashboard Component - Displays a list of exams for the lecturer.
 * Allows creating new exams, editing existing ones, and toggling their status.
 */
const TeacherDashboard = ({ onAddExam, onEditExam }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all exams from the mock database on mount
  useEffect(() => {
    loadExams();
  }, []);

  /**
   * Loads the exam list using MockDBService.
   */
  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await mockDBService.getExams();
      setExams(data);
    } catch (error) {
      console.error("Failed to load exams:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles the status of an exam between 'Draft' and 'Published'.
   */
  const handleToggleStatus = async (exam) => {
    const newStatus = exam.status === 'Published' ? 'Draft' : 'Published';
    try {
      await mockDBService.updateExamStatus(exam.id, newStatus);
      // Update local state to reflect the status change
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: newStatus } : e));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="teacher-container">Loading dashboard...</div>;


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
            <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => onEditExam(exam.id)}>Edit</button>
              <button 
                className={`btn-${exam.status === 'Draft' ? 'success' : 'warning'}`}
                onClick={() => handleToggleStatus(exam)}
              >
                {exam.status === 'Draft' ? 'Publish' : 'Unpublish'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
