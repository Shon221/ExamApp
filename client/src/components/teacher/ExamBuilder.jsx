import React, { useState, useEffect } from 'react';
import mockDBService from '../../services/MockDBService';
import './Teacher.css';

const QuestionForm = ({ question, onUpdate, onRemove }) => {
  // Updates a specific option's text in the question
  const handleOptionChange = (index, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ ...question, options: newOptions });
  };

  // Adds a new empty option to the multiple-choice question
  const addOption = () => {
    onUpdate({ ...question, options: [...(question.options || []), ''] });
  };

  // Removes an option from the multiple-choice question
  const removeOption = (index) => {
    const newOptions = (question.options || []).filter((_, i) => i !== index);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <div className="question-item">
      <button className="remove-btn" type="button" onClick={onRemove}>✕</button>
      <div className="form-group">
        <label>Question Text</label>
        <input
          type="text"
          value={question.text}
          onChange={(e) => onUpdate({ ...question, text: e.target.value })}
          placeholder="Enter your question here"
          required
        />
      </div>
      <div className="form-group">
        <label>Question Type</label>
        <select
          value={question.type}
          onChange={(e) => onUpdate({ ...question, type: e.target.value })}
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="open-ended">Open Ended</option>
        </select>
      </div>

      {question.type === 'multiple-choice' && (
        <div className="options-container" style={{ marginTop: '1rem' }}>
          <label>Options (Select the correct one)</label>
          {(question.options || []).map((opt, index) => (
            <div key={index} className="option-row" style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center' }}>
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.correctAnswer === opt && opt !== ''}
                onChange={() => onUpdate({ ...question, correctAnswer: opt })}
                required
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              <button type="button" onClick={() => removeOption(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addOption}>+ Add Option</button>
        </div>
      )}

      {question.type === 'open-ended' && (
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Correct Answer</label>
          <textarea
            value={question.correctAnswer || ''}
            onChange={(e) => onUpdate({ ...question, correctAnswer: e.target.value })}
            placeholder="Enter the expected answer"
            required
          />
        </div>
      )}
    </div>
  );
};

const ExamBuilder = ({ examId, onSave, onCancel }) => {
  // Manages the state of the entire exam being built or edited
  const [examData, setExamData] = useState({
    title: '',
    instructions: '',
    status: 'Draft',
    questions: []
  });
  const [loading, setLoading] = useState(!!examId); // Loading state for fetching existing exam

  // Effect to load existing exam data if an ID is provided
  useEffect(() => {
    if (examId) {
      const fetchExam = async () => {
        try {
          const data = await mockDBService.getExamById(examId);
          setExamData(data);
        } catch (error) {
          alert("Error loading exam data");
          onCancel();
        } finally {
          setLoading(false);
        }
      };
      fetchExam();
    }
  }, [examId, onCancel]);

  // Adds a new question with default multiple-choice structure
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: 'multiple-choice',
      options: ['', ''],
      correctAnswer: ''
    };
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Updates a specific question's properties in the examData state
  const updateQuestion = (id, updatedQuestion) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? updatedQuestion : q)
    }));
  };

  // Removes a question from the examData state
  const removeQuestion = (id) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  // Submits the exam data to the mock database
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (examId) {
        await mockDBService.updateExam(examId, examData);
      } else {
        await mockDBService.createExam(examData);
      }
      onSave?.(examData);
    } catch (error) {
      alert("Failed to save exam");
    }
  };

  if (loading) return <div className="teacher-container">Loading Exam Data...</div>;

  return (
    <div className="teacher-container">
      <form className="builder-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>{examId ? 'Edit Exam' : 'Exam Builder'}</h2>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>

        <div className="form-group">
          <label>Exam Title</label>
          <input
            type="text"
            value={examData.title}
            onChange={(e) => setExamData({ ...examData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Instructions</label>
          <textarea
            value={examData.instructions}
            onChange={(e) => setExamData({ ...examData, instructions: e.target.value })}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={examData.status}
            onChange={(e) => setExamData({ ...examData, status: e.target.value })}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>

        <div style={{ margin: '2rem 0' }}>
          <h3>Questions ({examData.questions.length})</h3>
          {examData.questions.map(q => (
            <QuestionForm
              key={q.id}
              question={q}
              onUpdate={(updated) => updateQuestion(q.id, updated)}
              onRemove={() => removeQuestion(q.id)}
            />
          ))}
          <button type="button" className="btn-secondary" onClick={addQuestion}>
            + Add Question
          </button>
        </div>

        <button type="submit" className="btn-primary">
          {examId ? 'Update Exam' : 'Save Exam'}
        </button>
      </form>
    </div>
  );
};

export default ExamBuilder;
