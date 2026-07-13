import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SubmissionStatus } from '../../entities';
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
        <p>View scores and results</p>
      </header>

      {loading ? (
        <p className="loading-text">Loading grades...</p>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <p>No submissions yet. Take an exam to see results here.</p>
        </div>
      ) : (
        <div className="card-grid">
          {submissions.map((submission) => (
            <article key={submission.id} className="card">
              <h3>Exam: {submission.examTitle || submission.examId}</h3>
              <p className="card__meta">
                Status: <span className={`badge badge--${submission.status}`}>{submission.status}</span>
              </p>
              {submission.score != null && (
                <p className="grade-score">
                  Score: <strong>{submission.score}%</strong>
                </p>
              )}
              {submission.totalPointsEarned != null && (
                <p className="card__meta">
                  Points: {submission.totalPointsEarned}/{submission.totalPossiblePoints}
                </p>
              )}
              {submission.submittedAt && (
                <p className="card__meta">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
              )}
              <div className="card__actions" style={{ marginTop: '0.75rem' }}>
                <Link
                  to={`/student/submissions/${submission.id}/review`}
                  className="btn btn--sm btn--outline"
                >
                  Review Answers
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
