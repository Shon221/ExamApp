import React, { useState, useEffect } from 'react';
import mockDBService from '../../services/MockDBService';
import './Student.css';

const ExamTaker = ({ examId, onFinish }) => {
  const [exam, setExam] = useState(null); // Stores the current exam data
  const [answers, setAnswers] = useState({}); // Stores student's selected answers
  const [submitting, setSubmitting] = useState(false); // Tracks submission state
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds

  // Fetches exam data when the component mounts or examId changes
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await mockDBService.getExamById(examId);
        setExam(data);
      } catch (error) {
        alert("Error loading exam");
      }
    };
    fetchExam();
  }, [examId]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); // Auto-submit when time is up
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Formats seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Updates the answers state when a student selects or types an answer
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Handles the exam submission process
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      // Sends the gathered answers to the mock database for processing
      // Partial submission is allowed as we don't validate all answers here
      const result = await mockDBService.submitExam({
        examId: exam.id,
        examTitle: exam.title,
        answers: answers
      });
      // Callback to the parent component with the result (e.g., score)
      onFinish(result);
    } catch (error) {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!exam) return <div className="student-container">Loading exam questions...</div>;

  return (
    <div className="student-container">
      <div className="exam-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>{exam.title}</h2>
          <p>{exam.instructions}</p>
        </div>
        <div className={`timer ${timeLeft < 300 ? 'text-danger' : ''}`} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="exam-form">
        {exam.questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <p><strong>Question {index + 1}:</strong> {q.text}</p>
            
            {q.type === 'multiple-choice' ? (
              <div className="options-list">
                {(q.options || []).map((opt, i) => (
                  <label key={i} className="option-label" style={{ display: 'block', marginBottom: '10px' }}>
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt} 
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      checked={answers[q.id] === opt}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <textarea 
                className="form-control"
                rows="4"
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
        
        <div className="form-actions">
          <button type="submit" className="btn-success" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Finish and Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamTaker;
