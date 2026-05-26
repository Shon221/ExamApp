import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExamStatus } from '../../entities';
import type { IExamData } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { MockApiService } from '../../services';

export function TeacherExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<IExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const api = MockApiService.getInstance();

  const loadExams = () => {
    if (!user) return;
    setLoading(true);
    api.getExamsByTeacher(user.id).then((res) => {
      if (res.success && res.data) setExams(res.data);
      setLoading(false);
    });
  };

  useEffect(loadExams, [user]);

  const handlePublish = async (examId: string) => {
    await api.publishExam(examId);
    loadExams();
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Delete this exam?')) return;
    await api.deleteExam(examId);
    loadExams();
  };

  return (
    <div>
      <header className="page-header page-header--row">
        <div>
          <h1>My Exams</h1>
          <p>Create, edit, and publish exams</p>
        </div>
        <Link to="/teacher/exams/new" className="btn btn--primary">
          + New Exam
        </Link>
      </header>

      {loading ? (
        <p className="loading-text">Loading exams...</p>
      ) : exams.length === 0 ? (
        <div className="empty-state">
          <p>No exams yet.</p>
          <Link to="/teacher/exams/new" className="btn btn--primary">
            Create your first exam
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="card">
              <div className="card__header">
                <h3>{exam.title}</h3>
                <span className={`badge badge--${exam.status}`}>{exam.status}</span>
              </div>
              <p className="card__desc">{exam.description}</p>
              <p className="card__meta">{exam.durationMinutes} min</p>
              <div className="card__actions">
                <Link to={`/teacher/exams/${exam.id}`} className="btn btn--sm btn--outline">
                  Edit
                </Link>
                {exam.status === ExamStatus.Draft && (
                  <button type="button" className="btn btn--sm btn--primary" onClick={() => handlePublish(exam.id)}>
                    Publish
                  </button>
                )}
                <button type="button" className="btn btn--sm btn--danger" onClick={() => handleDelete(exam.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
