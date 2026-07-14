import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BackendApiService } from '../../services';

export function StudentGradesPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const api = BackendApiService.getInstance();
    api.getSubmissionsByStudent(user.id).then((res) => {
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
      setLoading(false);
    });
  }, [user]);

  return (
    <div>
      <header className="page-header">
        <h1>My Grades</h1>
        <p>View your submitted exams, scores, and answers</p>
      </header>

      {loading ? (
        <p className="loading-text">Loading grades...</p>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <p>No submissions yet. Take an exam to see your results here.</p>
        </div>
      ) : (
        <div className="card-grid">
          {submissions.map((submission) => {
            const hasScore = submission.score != null;
            const scoreColor = hasScore
              ? submission.score >= 60 ? '#10b981' : '#ef4444'
              : '#94a3b8';

            return (
              <article key={submission.id} className="card">
                <h3>{submission.examTitle || 'Exam'}</h3>

                {/* Score — big and clear */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  margin: '0.75rem 0',
                }}>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: scoreColor,
                    lineHeight: 1,
                  }}>
                    {hasScore ? `${submission.score}%` : '—'}
                  </span>
                  {submission.totalPointsEarned != null && (
                    <span className="card__meta" style={{ fontSize: '0.9rem' }}>
                      ({submission.totalPointsEarned} / {submission.totalPossiblePoints} pts)
                    </span>
                  )}
                </div>

                <p className="card__meta">
                  Status:{' '}
                  <span className={`badge badge--${submission.status}`}>
                    {submission.status}
                  </span>
                </p>

                {submission.submittedAt && (
                  <p className="card__meta">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                )}

                {/* Primary CTA — review answers with per-question scores */}
                <div className="card__actions" style={{ marginTop: '1rem' }}>
                  <Link
                    to={`/student/submissions/${submission.id}/review`}
                    className="btn btn--sm btn--primary"
                  >
                    View Answers &amp; Scores
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
