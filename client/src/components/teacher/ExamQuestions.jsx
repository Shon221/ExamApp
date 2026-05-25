import React from 'react';

const ExamQuestions = ({ exam, onBack }) => {
  if (!exam) return null;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{exam.title} - Questions</h2>
          <button className="btn btn-light btn-sm" onClick={onBack}>
             &larr; Back to Dashboard
          </button>
        </div>
        <div className="card-body">
          <div className="list-group">
            {exam.questions.map((q, index) => (
              <div key={q.id} className="list-group-item mb-3 border rounded bg-white">
                <h5 className="mb-3">
                  <span className="badge bg-secondary me-2">Q{index + 1}</span>
                  {q.text}
                </h5>
                <div className="row g-2">
                  {q.options.map((option, i) => (
                    <div key={i} className="col-md-6">
                      <div className="p-2 border rounded bg-light">
                        <strong>{String.fromCharCode(65 + i)}.</strong> {option}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {exam.questions.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p>No questions found for this exam.</p>
            </div>
          )}
        </div>
        <div className="card-footer text-end border-top-0 bg-transparent pb-3">
          <button className="btn btn-secondary" onClick={onBack}>Close View</button>
        </div>
      </div>
    </div>
  );
};

export default ExamQuestions;
