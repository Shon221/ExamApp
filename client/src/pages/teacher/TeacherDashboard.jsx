import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExamStatus } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { MockApiService } from '../../services';

export function TeacherDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    MockApiService.getInstance()
      .getExamsByTeacher(user.id)
      .then((res) => {
        if (res.success && res.data) setExams(res.data);
        setLoading(false);
      });
  }, [user]);

  const published = exams.filter((e) => e.status === ExamStatus.Published).length;
  const drafts = exams.filter((e) => e.status === ExamStatus.Draft).length;

  return (
    <div>
      <header className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome back, {user?.fullName}</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__value">{loading ? '—' : exams.length}</span>
          <span className="stat-card__label">Total Exams</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{loading ? '—' : published}</span>
          <span className="stat-card__label">Published</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{loading ? '—' : drafts}</span>
          <span className="stat-card__label">Drafts</span>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/teacher/exams/new" className="btn btn--primary">
          + Create Exam
        </Link>
        <Link to="/teacher/exams" className="btn btn--outline">
          Manage Exams
        </Link>
        <Link to="/teacher/submissions" className="btn btn--outline">
          Review Submissions
        </Link>
      </div>
    </div>
  );
}
