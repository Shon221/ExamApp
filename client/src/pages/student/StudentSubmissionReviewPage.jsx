import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QuestionType } from '../../entities';
import { BackendApiService } from '../../services';

export function StudentSubmissionReviewPage() {
  const { submissionId } = useParams();
  const api = BackendApiService.getInstance();

  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!submissionId) return;
    api.getSubmissionReview(submissionId).then((res) => {
      if (res.success && res.data) {
        setSubmission(res.data.submission);
        setQuestions(res.data.questions);
      } else {
        setError(res.error || 'Failed to load review.');
      }
      setLoading(false);
    });
  }, [submissionId]);

  if (loading) return <p className="loading-text">Loading review...</p>;
  if (error) return <div className="alert alert--error">{error}</div>;
  if (!submission) return <p>Submission not found.</p>;

  // Build a quick lookup: questionId -> answer object
  const answerMap = {};
  (submission.answers || []).forEach((a) => {
    answerMap[a.questionId] = a;
  });

  return (
    <div>
      <header className="page-header page-header--row">
        <div>
          <h1>Review: {submission.examTitle || 'Exam Review'}</h1>
          <p className="card__meta">
            Score:&nbsp;<strong>{submission.score != null ? `${submission.score}%` : '—'}</strong>
            {submission.totalPointsEarned != null && (
              <> &nbsp;·&nbsp; {submission.totalPointsEarned}/{submission.totalPossiblePoints} pts</>
            )}
            &nbsp;·&nbsp;
            Status: <span className={`badge badge--${submission.status}`}>{submission.status}</span>
          </p>
        </div>
        <Link to="/student/grades" className="btn btn--outline btn--sm">
          ← Back to Grades
        </Link>
      </header>

      <div className="alert alert--info" style={{ marginBottom: '1.5rem' }}>
        This is a read-only review. Your answers cannot be changed.
      </div>

      <div className="questions-list">
        {questions.map((q, index) => {
          const answer = answerMap[q.id] || {};
          const isCorrect = answer.isCorrect;
          const pointsEarned = answer.pointsEarned ?? 0;

          return (
            <div
              key={q.id}
              className="question-card"
              style={{
                borderLeft: `4px solid ${isCorrect === true ? '#10b981' : isCorrect === false ? '#ef4444' : '#94a3b8'}`,
              }}
            >
              <h3>
                {index + 1}. {q.text}{' '}
                <span className="points">
                  ({pointsEarned} / {q.points} pts)
                </span>
              </h3>

              {q.type === QuestionType.MultipleChoice && (
                <div className="options-list">
                  {(q.options || []).map((opt) => (
                    <label key={opt} className="option-label" style={{ opacity: 0.85 }}>
                      <input
                        type="radio"
                        name={`review-${q.id}`}
                        value={opt}
                        checked={answer.value === opt}
                        readOnly
                        disabled
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.type === QuestionType.TrueFalse && (
                <div className="options-list">
                  {['true', 'false'].map((opt) => (
                    <label key={opt} className="option-label" style={{ opacity: 0.85 }}>
                      <input
                        type="radio"
                        name={`review-${q.id}`}
                        value={opt}
                        checked={answer.value === opt}
                        readOnly
                        disabled
                      />
                      {opt === 'true' ? 'True' : 'False'}
                    </label>
                  ))}
                </div>
              )}

              {q.type === QuestionType.OpenText && (
                <textarea
                  value={answer.value || '(No answer submitted)'}
                  rows={4}
                  disabled
                  style={{ width: '100%', resize: 'none', opacity: 0.85 }}
                />
              )}

              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {isCorrect === true && <span style={{ color: '#10b981' }}>✓ Correct</span>}
                {isCorrect === false && <span style={{ color: '#ef4444' }}>✗ Incorrect</span>}
                {isCorrect == null && <span style={{ color: '#94a3b8' }}>Not graded yet</span>}
              </p>

              {answer.feedback && (
                <div
                  className="alert alert--info"
                  style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}
                >
                  <strong>Feedback:</strong> {answer.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
