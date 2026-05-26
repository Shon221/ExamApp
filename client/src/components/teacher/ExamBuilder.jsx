import React, { useState, useEffect } from 'react';
import mockDBService from '../../services/MockDBService';
import './Teacher.css';

// טופס לשאלה בודדת בתוך בנאי הבחינה
const QuestionForm = ({ question, onUpdate, onRemove }) => {
  return (
    <div className="question-item">
      <button className="remove-btn" onClick={onRemove}>✕</button>
      <div className="form-group">
        <label>Question Text</label>
        <input
          type="text"
          value={question.text}
          onChange={(e) => onUpdate({ ...question, text: e.target.value })}
          placeholder="Enter your question here"
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
        <div style={{ marginTop: '1rem' }}>
          <p><small>Options management placeholder...</small></p>
        </div>
      )}
    </div>
  );
};

const ExamBuilder = ({ examId, onSave, onCancel }) => {
  // מצב הבחינה הנוכחי בטופס
  const [examData, setExamData] = useState({
    title: '',
    instructions: '',
    status: 'Draft',
    questions: []
  });
  const [loading, setLoading] = useState(!!examId);

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

  // הוספת שאלה חדשה לרשימת השאלות
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: 'multiple-choice',
      options: []
    };
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // עדכון שאלה קיימת לפי ה-id שלה
  const updateQuestion = (id, updatedQuestion) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? updatedQuestion : q)
    }));
  };

  // הסרת שאלה לפי id
  const removeQuestion = (id) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  // שמירת הבחינה
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
