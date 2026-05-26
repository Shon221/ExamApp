import React from 'react';
import './Student.css';

const ExamResults = ({ score = 85, feedback = "Great job! You showed a strong understanding of the core concepts.", onBackToDashboard }) => {
  return (
    <div className="student-container">
      <div className="results-card">
        <h2>Exam Completed!</h2>
        <p>Your score is:</p>
        <div className="score-display">{score}%</div>
        <div style={{ margin: '2rem 0', color: '#4b5563' }}>
          <p><strong>Feedback:</strong></p>
          <p>{feedback}</p>
        </div>
        <button className="btn-primary" onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ExamResults;
