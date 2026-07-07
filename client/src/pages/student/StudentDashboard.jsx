import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SubmissionStatus } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { MockApiService } from '../../services';

export function StudentDashboard() {
  const { user } = useAuth();
  const [publishedCount, setPublishedCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const api = MockApiService.getInstance();
    Promise.all([api.getPublishedExams(), api.getSubmissionsByStudent(user.id)]).then(
      ([examsRes, subsRes]) => {
        if (examsRes.success && examsRes.data) setPublishedCount(examsRes.data.length);
        if (subsRes.success && subsRes.data) {
          setGradedCount(subsRes.data.filter((s) => s.status === SubmissionStatus.Graded).length);
        }
      },
    );
  }, [user]);

  return (
    <div>
      <header className="page-header">
        <h1>Student Dashboard</h1>
        <p>Welcome, {user?.fullName}</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__value">{publishedCount}</span>
          <span className="stat-card__label">Available Exams</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{gradedCount}</span>
          <span className="stat-card__label">Graded Results</span>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/student/exams" className="btn btn--primary">
          Browse Exams
        </Link>
        <Link to="/student/grades" className="btn btn--outline">
          View Grades
        </Link>
      </div>
    </div>
  );
}
