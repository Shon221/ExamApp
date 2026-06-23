import { useEffect, useState } from 'react';
import { SubmissionStatus } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { MockApiService } from '../../services';

export function StudentGradesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const api = MockApiService.getInstance();
    api.getSubmissionsByStudent(user.id).then(async (res) => {
      if (!res.success || !res.data) {
        setLoading(false);
        return;
      }
      const graded = res.data.filter(
        (s) => s.status === SubmissionStatus.Graded || s.status === SubmissionStatus.Submitted,
      );
      const enriched = [];
      for (const sub of graded) {
        const examRes = await api.getExam(sub.examId);
        enriched.push({ submission: sub, exam: examRes.data });
      }
      setRows(enriched);
      setLoading(false);
    });
  }, [user]);

  return (
    <div>
      <header className="page-header">
        <h1>My Grades</h1>
        <p>View scores and instructor feedback</p>
      </header>

      {loading ? (
        <p className="loading-text">Loading grades...</p>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <p>No submissions yet. Take an exam to see results here.</p>
        </div>
      ) : (
        <div className="card-grid">
          {rows.map(({ submission, exam }) => (
            <article key={submission.id} className="card">
              <h3>{exam?.title ?? submission.examId}</h3>
              <p className="card__meta">
                Status: <span className={`badge badge--${submission.status}`}>{submission.status}</span>
              </p>
              {submission.score !== undefined && (
                <p className="grade-score">
                  Score: <strong>{submission.score}</strong>
                </p>
              )}
              {submission.feedback && <p className="card__desc">{submission.feedback}</p>}
              {submission.submittedAt && (
                <p className="card__meta">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
