import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamStatus, QuestionType } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { BackendApiService } from '../../services';

const QUESTION_TYPES = [
  { value: QuestionType.MultipleChoice, label: 'Multiple Choice' },
  { value: QuestionType.TrueFalse, label: 'True / False' },
  { value: QuestionType.OpenText, label: 'Open Text' },
];

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
      await api.updateExam(currentExamId, { title, description, durationMinutes });
      return currentExamId;
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
    await saveExam();
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

  const updateQuestion = async (q) => {
    if (!q.text || q.text.trim().length === 0) {
      setQuestions(questions.map((x) => (x.id === q.id ? q : x)));
      return;
    }
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
        <button type="submit" className="btn btn--primary">
          Save Exam
        </button>
      </form>

      <section className="form-section">
        <div className="page-header page-header--row">
          <h2>Questions</h2>
          <button type="button" className="btn btn--outline" onClick={addQuestion} disabled={!title}>
            + Add Question
          </button>
        </div>

        {questions.map((q) => (
          <QuestionEditorCard
            key={q.id}
            question={q}
            onChange={updateQuestion}
            onDelete={() => removeQuestion(q.id)}
          />
        ))}
      </section>
    </div>
  );
}

function QuestionEditorCard({ question, onChange, onDelete }) {
  const patch = (partial) => onChange({ ...question, ...partial });

  return (
    <div className="question-card">
      <label>
        Question text
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
          Options (comma-separated)
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
        Correct answer
        <input
          value={String(question.correctAnswer ?? '')}
          onChange={(e) => patch({ correctAnswer: e.target.value })}
        />
      </label>
      <div className="card__actions">
        <button type="button" className="btn btn--sm btn--primary" onClick={() => onChange(question)}>
          Save Question
        </button>
        <button type="button" className="btn btn--sm btn--danger" onClick={onDelete}>
          Remove
        </button>
      </div>
    </div>
  );
}
