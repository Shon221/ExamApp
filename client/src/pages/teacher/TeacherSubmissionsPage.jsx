import { useEffect, useState } from 'react';
import { QuestionType, SubmissionStatus } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { BackendApiService } from '../../services';

export function TeacherSubmissionsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  
  const api = BackendApiService.getInstance();

  useEffect(() => {
    if (!user) return;
    api.getExamsByTeacher(user.id).then((res) => {
      if (res.success && res.data) {
        setExams(res.data);
        if (res.data.length) setSelectedExamId(res.data[0].id);
      }
    }).catch(err => console.error('Failed to load exams:', err));
  }, [user]);

  useEffect(() => {
    if (!selectedExamId) return;
    setGradingSubmissionId(null);
    Promise.all([
      api.getSubmissionsByExam(selectedExamId),
      api.getQuestionsByExam(selectedExamId),
    ]).then(([subsRes, quesRes]) => {
      if (subsRes.success && subsRes.data) setSubmissions(subsRes.data);
      if (quesRes.success && quesRes.data) setQuestions(quesRes.data);
    }).catch(err => console.error('Failed to load submissions:', err));
  }, [selectedExamId]);

  const handleGradeSave = async (submissionId, questionId, pointsEarned, feedback) => {
    const res = await api.gradeAnswer(submissionId, questionId, pointsEarned, feedback);
    if (res.success && res.data) {
      // Update local submissions list with the updated submission
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? res.data : s)));
    }
  };

  const gradingSubmission = submissions.find(s => s.id === gradingSubmissionId);

  return (
    <div>
      <header className="page-header">
        <h1>Student Submissions</h1>
        <p>Review auto-graded exam submissions and manually grade open answers</p>
      </header>

      <label className="filter-bar">
        Select exam
        <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </label>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <p>No submissions for this exam yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Score</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                // Check if any open_text answers require manual review
                // (e.g. they might be auto-graded 0 by default)
                const hasOpenText = questions.some(q => q.type === QuestionType.OpenText);
                
                return (
                  <tr key={sub.id}>
                    <td>{sub.studentId}</td>
                    <td>
                      <span className={`badge badge--${sub.status}`}>{sub.status}</span>
                      {hasOpenText && <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'orange' }}>Needs Review</span>}
                    </td>
                    <td>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}</td>
                    <td>{sub.score != null ? `${sub.score}%` : '—'}</td>
                    <td>
                      {sub.totalPointsEarned != null
                        ? `${sub.totalPointsEarned}/${sub.totalPossiblePoints}`
                        : '—'}
                    </td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn--sm btn--outline" 
                        onClick={() => setGradingSubmissionId(sub.id === gradingSubmissionId ? null : sub.id)}
                      >
                        {sub.id === gradingSubmissionId ? 'Close Review' : 'Review / Grade'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {gradingSubmission && (
        <section className="form-section" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
          <h2>Reviewing Submission for Student: {gradingSubmission.studentId}</h2>
          <div className="questions-list">
            {questions.map((q, index) => {
              const answer = gradingSubmission.answers.find(a => a.questionId === q.id) || {};
              const isOpenText = q.type === QuestionType.OpenText;
              
              return (
                <div key={q.id} className="question-card">
                  <h3>{index + 1}. {q.text} (Max {q.points} pts)</h3>
                  <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '4px', margin: '1rem 0' }}>
                    <strong>Student's Answer: </strong>
                    <span>{answer.value || '(No answer)'}</span>
                  </div>
                  
                  {isOpenText ? (
                    <ManualGradingForm 
                      submissionId={gradingSubmission.id}
                      questionId={q.id}
                      initialPoints={answer.pointsEarned || 0}
                      initialFeedback={answer.feedback || ''}
                      maxPoints={q.points}
                      onSave={handleGradeSave}
                    />
                  ) : (
                    <div>
                      <p>Auto-graded: {answer.isCorrect ? 'Correct' : 'Incorrect'} ({answer.pointsEarned || 0} / {q.points} pts)</p>
                      {/* You could optionally allow overriding auto-graded ones too by reusing ManualGradingForm */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function ManualGradingForm({ submissionId, questionId, initialPoints, initialFeedback, maxPoints, onSave }) {
  const [points, setPoints] = useState(initialPoints);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(submissionId, questionId, Number(points), feedback);
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <div className="form-row">
        <label>
          Points Awarded
          <input 
            type="number" 
            min={0} 
            max={maxPoints} 
            value={points} 
            onChange={e => setPoints(e.target.value)} 
          />
        </label>
        <label style={{ flex: 1 }}>
          Feedback to Student
          <input 
            type="text" 
            value={feedback} 
            onChange={e => setFeedback(e.target.value)} 
            placeholder="Good job, but..."
          />
        </label>
      </div>
      <div>
        <button type="button" className="btn btn--sm btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Grade'}
        </button>
      </div>
    </div>
  );
}
