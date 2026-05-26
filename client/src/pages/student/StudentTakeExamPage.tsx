import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionType, SubmissionStatus } from '../../entities';
import type { IAnswerData, IExamData, IQuestionData, ISubmissionData } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { ConfigService, MockApiService } from '../../services';

export function StudentTakeExamPage() {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const api = MockApiService.getInstance();
  const autoSaveMs = ConfigService.getInstance().get('examAutoSaveIntervalMs');

  const [exam, setExam] = useState<IExamData | null>(null);
  const [questions, setQuestions] = useState<IQuestionData[]>([]);
  const [submission, setSubmission] = useState<ISubmissionData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId || !user) return;
    Promise.all([
      api.getExam(examId),
      api.getQuestionsByExam(examId),
      api.getOrCreateSubmission(examId, user.id),
    ]).then(([examRes, qRes, subRes]) => {
      if (examRes.success && examRes.data) setExam(examRes.data);
      if (qRes.success && qRes.data) setQuestions(qRes.data);
      if (subRes.success && subRes.data) {
        setSubmission(subRes.data);
        const map: Record<string, string> = {};
        subRes.data.answers.forEach((a) => {
          map[a.questionId] = Array.isArray(a.value) ? a.value.join(',') : String(a.value);
        });
        setAnswers(map);
      }
      setLoading(false);
    });
  }, [examId, user]);

  useEffect(() => {
    if (!submission || submission.status !== SubmissionStatus.InProgress) return;
    const interval = setInterval(() => {
      saveAnswers(false);
    }, autoSaveMs);
    return () => clearInterval(interval);
  }, [submission, answers]);

  const saveAnswers = async (showNotify = true) => {
    if (!submission) return;
    const payload: IAnswerData[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    const res = await api.saveAnswers(submission.id, payload);
    if (res.success && res.data) setSubmission(res.data);
    if (showNotify && res.success) {
      // auto-save is silent; NotifyService used on submit
    }
  };

  const handleSubmit = async () => {
    if (!submission) return;
    if (!confirm('Submit exam? You cannot change answers after submission.')) return;
    await saveAnswers(false);
    const res = await api.submitExam(submission.id);
    if (res.success) navigate('/student/grades');
  };

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (loading) return <p className="loading-text">Loading exam...</p>;
  if (!exam || !submission) return <p>Exam not found.</p>;

  const isSubmitted = submission.status !== SubmissionStatus.InProgress;

  return (
    <div>
      <header className="page-header page-header--row">
        <div>
          <h1>{exam.title}</h1>
          <p>{exam.durationMinutes} min · {questions.length} questions</p>
        </div>
        {!isSubmitted && (
          <button type="button" className="btn btn--primary" onClick={handleSubmit}>
            Submit Exam
          </button>
        )}
      </header>

      {isSubmitted && (
        <div className="alert alert--info">This exam has already been submitted.</div>
      )}

      <div className="questions-list">
        {questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <h3>
              {index + 1}. {q.text} <span className="points">({q.points} pts)</span>
            </h3>
            {q.type === QuestionType.MultipleChoice && (
              <div className="options-list">
                {(q.options ?? []).map((opt) => (
                  <label key={opt} className="option-label">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswer(q.id, opt)}
                      disabled={isSubmitted}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {q.type === QuestionType.TrueFalse && (
              <div className="options-list">
                {['true', 'false'].map((opt) => (
                  <label key={opt} className="option-label">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswer(q.id, opt)}
                      disabled={isSubmitted}
                    />
                    {opt === 'true' ? 'True' : 'False'}
                  </label>
                ))}
              </div>
            )}
            {q.type === QuestionType.OpenText && (
              <textarea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                rows={4}
                disabled={isSubmitted}
                placeholder="Your answer..."
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
