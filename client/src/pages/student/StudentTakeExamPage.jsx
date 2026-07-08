import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionType } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { BackendApiService } from '../../services';

export function StudentTakeExamPage() {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const api = BackendApiService.getInstance();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  // Autosave status: '', 'Saving...', 'Saved', 'Failed to save'
  const [saveStatus, setSaveStatus] = useState('');
  const autosaveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!examId || !user) return;
    
    // Load exam and draft in parallel
    Promise.all([
      api.getExamForStudent(examId),
      api.getExamDraft(examId)
    ]).then(([examRes, draftRes]) => {
      if (examRes.success && examRes.data) {
        setExam(examRes.data.exam);
        setQuestions(examRes.data.questions);
      }
      
      if (draftRes.success && draftRes.data) {
        // draftRes.data is array: [{ questionId, value }]
        const draftAnswers = {};
        draftRes.data.forEach(a => {
          draftAnswers[a.questionId] = a.value;
        });
        setAnswers(draftAnswers);
      }
      
      setLoading(false);
    });
  }, [examId, user]);

  const triggerAutosave = (newAnswers) => {
    setSaveStatus('Saving...');
    
    const answersPayload = Object.entries(newAnswers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    
    api.saveExamDraft(examId, answersPayload).then(res => {
      if (res.success) {
        setSaveStatus('Saved');
      } else {
        setSaveStatus('Failed to save');
      }
    });
  };

  const setAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Debounce autosave
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    setSaveStatus('Saving...');
    autosaveTimeoutRef.current = setTimeout(() => {
      triggerAutosave(newAnswers);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!confirm('Submit exam? You cannot change answers after submission.')) return;

    // Build answers array from the local state
    const answersPayload = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    const res = await api.submitExam(examId, answersPayload);
    if (res.success) {
      setSubmitted(true);
      navigate('/student/grades');
    }
  };

  if (loading) return <p className="loading-text">Loading exam...</p>;
  if (!exam) return <p>Exam not found.</p>;

  return (
    <div>
      <header className="page-header page-header--row">
        <div>
          <h1>{exam.title}</h1>
          <p>{exam.durationMinutes} min · {questions.length} questions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {saveStatus && (
            <span style={{ fontSize: '0.9rem', color: saveStatus === 'Failed to save' ? 'var(--color-danger)' : 'var(--color-text-light)' }}>
              {saveStatus}
            </span>
          )}
          {!submitted && (
            <button type="button" className="btn btn--primary" onClick={handleSubmit}>
              Submit Exam
            </button>
          )}
        </div>
      </header>

      {submitted && (
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
                      disabled={submitted}
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
                      disabled={submitted}
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
                disabled={submitted}
                placeholder="Your answer..."
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
