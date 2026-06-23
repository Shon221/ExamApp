import { useEffect, useState } from 'react';
import { SubmissionStatus } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { MockApiService } from '../../services';

export function TeacherSubmissionsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [gradingId, setGradingId] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const api = MockApiService.getInstance();

  useEffect(() => {
    if (!user) return;
    api.getExamsByTeacher(user.id).then((res) => {
      if (res.success && res.data) {
        setExams(res.data);
        if (res.data.length) setSelectedExamId(res.data[0].id);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!selectedExamId) return;
    api.getSubmissionsByExam(selectedExamId).then(async (res) => {
      if (!res.success || !res.data) return;
      setSubmissions(res.data);
      const names = {};
      for (const sub of res.data) {
        const userRes = await api.getUser(sub.studentId);
        if (userRes.success && userRes.data) names[sub.studentId] = userRes.data.fullName;
      }
      setStudentNames(names);
    });
  }, [selectedExamId]);

  const handleGrade = async (submissionId) => {
    await api.gradeSubmission(submissionId, score, feedback);
    setGradingId(null);
    const res = await api.getSubmissionsByExam(selectedExamId);
    if (res.success && res.data) setSubmissions(res.data);
  };

  return (
    <div>
      <header className="page-header">
        <h1>Student Submissions</h1>
        <p>Review and grade exam submissions</p>
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
                <th>Student</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{studentNames[sub.studentId] ?? sub.studentId}</td>
                  <td>
                    <span className={`badge badge--${sub.status}`}>{sub.status}</span>
                  </td>
                  <td>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}</td>
                  <td>{sub.score ?? '—'}</td>
                  <td>
                    {sub.status === SubmissionStatus.Submitted && (
                      <button
                        type="button"
                        className="btn btn--sm btn--primary"
                        onClick={() => {
                          setGradingId(sub.id);
                          setScore(0);
                          setFeedback('');
                        }}
                      >
                        Grade
                      </button>
                    )}
                    {sub.status === SubmissionStatus.Graded && sub.feedback && (
                      <span className="feedback-preview" title={sub.feedback}>
                        {sub.feedback.slice(0, 40)}…
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {gradingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Grade Submission</h3>
            <label>
              Score
              <input type="number" min={0} value={score} onChange={(e) => setScore(Number(e.target.value))} />
            </label>
            <label>
              Feedback
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} />
            </label>
            <div className="card__actions">
              <button type="button" className="btn btn--primary" onClick={() => handleGrade(gradingId)}>
                Publish Grade
              </button>
              <button type="button" className="btn btn--outline" onClick={() => setGradingId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
