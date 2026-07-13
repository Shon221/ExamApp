import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamStatus, QuestionType } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { BackendApiService, NotifyService } from '../../services';

const QUESTION_TYPES = [
  { value: QuestionType.MultipleChoice, label: 'Multiple Choice' },
  { value: QuestionType.TrueFalse, label: 'True / False' },
  { value: QuestionType.OpenText, label: 'Open Text' },
];

/**
 * Validate a single question object.
 * Returns an error string if invalid, or null if valid.
 */
function validateQuestion(q) {
  if (!q.text || q.text.trim().length === 0) {
    return 'Question text is required.';
  }

  if (q.type === QuestionType.MultipleChoice) {
    const nonEmpty = (q.options || []).filter((o) => o.trim().length > 0);
    if (nonEmpty.length < 2) {
      return 'Multiple-choice questions need at least 2 non-empty options.';
    }
    const correctTrimmed = (q.correctAnswer || '').trim();
    if (!correctTrimmed) {
      return 'A correct answer is required.';
    }
    if (!nonEmpty.map((o) => o.trim()).includes(correctTrimmed)) {
      return `Correct answer must match one of the options: ${nonEmpty.join(', ')}`;
    }
  }

  if (q.type === QuestionType.TrueFalse) {
    const val = (q.correctAnswer || '').trim().toLowerCase();
    if (val !== 'true' && val !== 'false') {
      return 'Correct answer for True/False must be "true" or "false".';
    }
  }

  if (q.type === QuestionType.OpenText) {
    if (!q.correctAnswer || q.correctAnswer.trim().length === 0) {
      return 'An expected/reference answer is required for open-text questions.';
    }
  }

  return null;
}

export function TeacherExamEditorPage() {
  const { examId } = useParams();
  const isNew = !examId || examId === 'new';
  const { user } = useAuth();
  const navigate = useNavigate();
  const api = BackendApiService.getInstance();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [currentExamId, setCurrentExamId] = useState(isNew ? null : examId ?? null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  // Map of questionId → validation error string
  const [questionErrors, setQuestionErrors] = useState({});
  const notify = NotifyService.getInstance();

  useEffect(() => {
    if (isNew || !examId) return;
    Promise.all([api.getExam(examId), api.getQuestionsByExam(examId)]).then(([examRes, qRes]) => {
      if (examRes.success && examRes.data) {
        setTitle(examRes.data.title);
        setDescription(examRes.data.description);
        setDurationMinutes(examRes.data.durationMinutes);
        setCurrentExamId(examRes.data.id);
      }
      if (qRes.success && qRes.data) setQuestions(qRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load exam editor data:', err);
      setLoading(false);
    });
  }, [examId, isNew]);

  const saveExam = async () => {
    if (!user) return null;
    if (currentExamId) {
      const res = await api.updateExam(currentExamId, { title, description, durationMinutes });
      return res.success ? currentExamId : null;
    }
    const res = await api.createExam({
      title,
      description,
      teacherId: user.id,
      status: ExamStatus.Draft,
      durationMinutes,
    });
    if (res.success && res.data) {
      setCurrentExamId(res.data.id);
      navigate(`/teacher/exams/${res.data.id}`, { replace: true });
      return res.data.id;
    }
    return null;
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await saveExam();
    setSaving(false);
    if (!result) {
      notify.error('Failed to save exam. Please try again.');
    }
  };

  const addQuestion = async () => {
    const eid = currentExamId ?? (await saveExam());
    if (!eid) return;
    const newQ = {
      id: `q-${Date.now()}`,
      examId: eid,
      text: '',
      type: QuestionType.MultipleChoice,
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option A',
      points: 10,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQ]);
  };

  /**
   * Called when a question field changes (live local update, no API call yet).
   * Also called when "Save Question" is clicked — in that case we validate first.
   */
  const updateQuestion = async (q, { trySave = false } = {}) => {
    // Always persist the local edit immediately
    setQuestions((prev) => prev.map((x) => (x.id === q.id ? q : x)));

    if (!trySave) return; // Only validate + save when explicitly requested

    const error = validateQuestion(q);
    if (error) {
      setQuestionErrors((prev) => ({ ...prev, [q.id]: error }));
      notify.error(`Question ${questions.findIndex((x) => x.id === q.id) + 1}: ${error}`);
      return;
    }

    // Clear any previous error for this question
    setQuestionErrors((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });

    await api.saveQuestion(q);
    if (currentExamId) {
      const res = await api.getQuestionsByExam(currentExamId);
      if (res.success && res.data) setQuestions(res.data);
    }
  };

  const removeQuestion = async (questionId) => {
    if (!String(questionId).startsWith('q-')) {
      await api.deleteQuestion(questionId, currentExamId);
    }
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setQuestionErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  if (loading) return <p className="loading-text">Loading exam...</p>;

  return (
    <div>
      <header className="page-header">
        <h1>{isNew ? 'Create Exam' : 'Edit Exam'}</h1>
      </header>

      <form onSubmit={handleSaveExam} className="form-section">
        <div className="form-row">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Duration (minutes)
            <input
              type="number"
              min={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            />
          </label>
        </div>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Exam'}
        </button>
      </form>

      <section className="form-section">
        <div className="page-header page-header--row">
          <h2>Questions</h2>
          <button type="button" className="btn btn--outline" onClick={addQuestion} disabled={!title}>
            + Add Question
          </button>
        </div>

        {questions.length === 0 && currentExamId && (
          <div className="empty-state" style={{ padding: '1rem' }}>
            <p>No questions yet. Add at least one question before publishing.</p>
          </div>
        )}

        {questions.map((q, index) => (
          <QuestionEditorCard
            key={q.id}
            index={index}
            question={q}
            error={questionErrors[q.id] || null}
            onChange={(updated) => updateQuestion(updated)}
            onSave={(updated) => updateQuestion(updated, { trySave: true })}
            onDelete={() => removeQuestion(q.id)}
          />
        ))}
      </section>
    </div>
  );
}

function QuestionEditorCard({ index, question, error, onChange, onSave, onDelete }) {
  const patch = (partial) => onChange({ ...question, ...partial });

  return (
    <div className="question-card" style={{ borderLeft: error ? '3px solid #ef4444' : undefined }}>
      <label>
        Question {index + 1} text
        <input value={question.text} onChange={(e) => patch({ text: e.target.value })} />
      </label>

      <div className="form-row">
        <label>
          Type
          <select value={question.type} onChange={(e) => patch({ type: e.target.value })}>
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Points
          <input
            type="number"
            min={1}
            value={question.points}
            onChange={(e) => patch({ points: Number(e.target.value) })}
          />
        </label>
      </div>

      {question.type === QuestionType.MultipleChoice && (
        <label>
          Options (comma-separated, min 2)
          <input
            value={(question.options ?? []).join(', ')}
            onChange={(e) =>
              patch({
                options: e.target.value.split(',').map((s) => s.trim()),
              })
            }
          />
        </label>
      )}

      <label>
        {question.type === QuestionType.OpenText ? 'Expected / reference answer' : 'Correct answer'}
        <input
          value={String(question.correctAnswer ?? '')}
          onChange={(e) => patch({ correctAnswer: e.target.value })}
          placeholder={
            question.type === QuestionType.TrueFalse
              ? 'true or false'
              : question.type === QuestionType.MultipleChoice
              ? 'Must match one of the options above'
              : 'Expected answer'
          }
        />
      </label>

      {/* Inline validation error */}
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          ⚠ {error}
        </p>
      )}

      <div className="card__actions">
        <button type="button" className="btn btn--sm btn--primary" onClick={() => onSave(question)}>
          Save Question
        </button>
        <button type="button" className="btn btn--sm btn--danger" onClick={onDelete}>
          Remove
        </button>
      </div>
    </div>
  );
}
