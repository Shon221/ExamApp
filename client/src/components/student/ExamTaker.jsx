import React, { useState } from 'react';
import './Student.css';

const ExamTaker = ({ exam, onSubmit }) => {
  // Mock questions for the taker
  const [questions] = useState([
    {
      id: 1,
      type: 'multiple-choice',
      text: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)']
    },
    {
      id: 2,
      type: 'open-ended',
      text: 'Explain the difference between let and const in JavaScript.'
    }
  ]);

  const [answers, setAnswers] = useState({});

  const handleOptionChange = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleOpenAnswerChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit your exam?')) {
      console.log('Submitted Answers:', answers);
      onSubmit(answers);
    }
  };

  return (
    <div className="student-container">
      <div className="taker-header">
        <h2>Taking Exam: {exam?.title || 'Current Exam'}</h2>
        <p>Please answer all questions before submitting.</p>
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="question-card">
          <p><strong>Question {index + 1}</strong></p>
          <p>{q.text}</p>
          
          {q.type === 'multiple-choice' ? (
            <div className="options-group">
              {q.options.map(option => (
                <label 
                  key={option} 
                  className={`option-label ${answers[q.id] === option ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={() => handleOptionChange(q.id, option)}
                    style={{ display: 'none' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="open-answer"
              placeholder="Type your answer here..."
              value={answers[q.id] || ''}
              onChange={(e) => handleOpenAnswerChange(q.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <div style={{ textAlign: 'right', marginBottom: '3rem' }}>
        <button className="btn-primary" onClick={handleSubmit}>
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default ExamTaker;
