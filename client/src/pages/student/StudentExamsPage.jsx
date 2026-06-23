import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MockApiService } from '../../services';

export function StudentExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockApiService.getInstance().getPublishedExams().then((res) => {
      if (res.success && res.data) setExams(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1>Available Exams</h1>
        <p>Select an exam to begin</p>
      </header>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : exams.length === 0 ? (
        <div className="empty-state">
          <p>No published exams at the moment.</p>
        </div>
      ) : (
        <div className="card-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="card">
              <h3>{exam.title}</h3>
              <p className="card__desc">{exam.description}</p>
              <p className="card__meta">{exam.durationMinutes} minutes</p>
              <Link to={`/student/exams/${exam.id}/take`} className="btn btn--primary">
                Enter Exam
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
