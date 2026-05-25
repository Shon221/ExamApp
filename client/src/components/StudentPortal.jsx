import React, { useState } from 'react';
import * as examService from '../api/examService';
import ExamQuestions from './teacher/ExamQuestions';

const StudentPortal = () => {
  const [examId, setExamId] = useState('');
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);

  // פונקציה אסינכרונית לטיפול בשליחת הטופס ומשיכת המידע
  const handleFetchExam = async (e) => {
    e.preventDefault();
    if (!examId.trim()) return;

    setLoading(true);
    setError('');
    setExam(null);
    setShowQuestions(false);

    try {
      // קריאה לפונקציית ה-API המדומה (Mock)
      // שימוש ב-await כי מדובר בפעולה שלוקחת זמן (Promise)
      const data = await examService.getExamById(examId);
      setExam(data);
    } catch (err) {
      setError('Exam not found. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showQuestions && exam) {
    return <ExamQuestions exam={exam} onBack={() => setShowQuestions(false)} />;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h2 className="mb-0">Student Portal</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleFetchExam} className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter Exam ID to Start (e.g., 1 or 2)"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              />
              <button className="btn btn-success" type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Start Exam'}
              </button>
            </div>
          </form>

          {error && <div className="alert alert-danger">{error}</div>}

          {exam && (
            <div className="mt-4 p-4 border rounded bg-light">
              <h3>Ready to start: {exam.title}</h3>
              <p className="lead">This exam contains {exam.questions.length} questions.</p>
              <button
                className="btn btn-primary btn-lg w-100"
                onClick={() => setShowQuestions(true)}
              >
                Begin Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
