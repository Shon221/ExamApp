import React, { useState, useEffect } from 'react';
import mockDBService from '../../services/MockDBService';
import './Teacher.css';

const TeacherDashboard = ({ onAddExam, onEditExam }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

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

  const handleToggleStatus = async (exam) => {
    const newStatus = exam.status === 'Published' ? 'Draft' : 'Published';
    try {
      await mockDBService.updateExamStatus(exam.id, newStatus);
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
