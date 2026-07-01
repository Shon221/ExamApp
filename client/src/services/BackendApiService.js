/**
 * BackendApiService.js
 * Replaces MockApiService by mapping every method to real Express server endpoints.
 * Handles all field-name translation between client (camelCase) and server (snake_case),
 * as well as role mapping (client 'teacher' ↔ server 'lecturer').
 *
 * Every public method returns the same { success, data } / { success: false, error } shape
 * that MockApiService returned, so components don't need to change their response handling.
 */

import { ApiClient } from './ApiClient';
import { LoggerService } from './LoggerService';
import { NotifyService } from './NotifyService';

// ─── Field Mapping Helpers ────────────────────────────────────────────────────

/** Map client role to server role */
const roleToServer = (role) => (role === 'teacher' ? 'lecturer' : role);

/** Map server role to client role */
const roleToClient = (role) => (role === 'lecturer' ? 'teacher' : role);

/** Map client question type to server question type */
const questionTypeToServer = (type) => {
  const map = {
    multiple_choice: 'multiple-choice',
    true_false: 'true-false',
    open_text: 'short-answer',
  };
  return map[type] || type;
};

/** Map server question type to client question type */
const questionTypeToClient = (type) => {
  const map = {
    'multiple-choice': 'multiple_choice',
    'true-false': 'true_false',
    'short-answer': 'open_text',
  };
  return map[type] || type;
};

/** Map a server user object to client shape */
const mapUserToClient = (serverUser) => {
  if (!serverUser) return null;
  return {
    id: serverUser.id,
    email: serverUser.email,
    fullName: serverUser.name,
    role: roleToClient(serverUser.role),
    createdAt: serverUser.created_at,
  };
};

/** Map a server exam object to client shape */
const mapExamToClient = (serverExam) => {
  if (!serverExam) return null;
  return {
    id: serverExam.id,
    title: serverExam.title,
    description: serverExam.instructions || '',
    teacherId: serverExam.lecturer_id,
    status: serverExam.status,
    durationMinutes: serverExam.duration_minutes,
    passingScore: serverExam.passing_score,
    questions: serverExam.questions || [],
    createdAt: serverExam.created_at,
    updatedAt: serverExam.updated_at,
  };
};

/** Map a client exam to server shape for create/update */
const mapExamToServer = (clientExam) => ({
  title: clientExam.title,
  instructions: clientExam.description || '',
  duration_minutes: clientExam.durationMinutes,
  passing_score: clientExam.passingScore ?? 60,
});

/** Map a server question object to client shape */
const mapQuestionToClient = (serverQ) => {
  if (!serverQ) return null;
  return {
    id: serverQ.id,
    examId: serverQ.exam_id,
    type: questionTypeToClient(serverQ.type),
    text: serverQ.text,
    options: serverQ.options || [],
    correctAnswer: serverQ.correct_answer,
    order: serverQ.order,
    points: serverQ.points,
  };
};

/** Map a client question to server shape for create/update */
const mapQuestionToServer = (clientQ) => ({
  type: questionTypeToServer(clientQ.type),
  text: clientQ.text,
  options: clientQ.options || [],
  correct_answer: clientQ.correctAnswer || '',
  order: clientQ.order,
  points: clientQ.points,
});

/** Map a server submission to client shape */
const mapSubmissionToClient = (serverSub) => {
  if (!serverSub) return null;
  return {
    id: serverSub.id,
    examId: serverSub.exam_id,
    studentId: serverSub.student_id,
    answers: (serverSub.answers || []).map((a) => ({
      questionId: a.question_id,
      value: a.answer,
      isCorrect: a.is_correct,
      pointsEarned: a.points_earned,
    })),
    score: serverSub.score,
    totalPointsEarned: serverSub.total_points_earned,
    totalPossiblePoints: serverSub.total_possible_points,
    status: serverSub.status,
    submittedAt: serverSub.submitted_at,
    timeSpentMinutes: serverSub.time_spent_minutes,
  };
};

// ─── BackendApiService ────────────────────────────────────────────────────────

export class BackendApiService {
  static instance = null;

  constructor() {
    this.client = ApiClient.getInstance();
    this.logger = LoggerService.getInstance();
    this.notify = NotifyService.getInstance();
  }

  static getInstance() {
    if (!BackendApiService.instance) {
      BackendApiService.instance = new BackendApiService();
    }
    return BackendApiService.instance;
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  /**
   * POST /api/auth/login
   * Returns { success, data: { user, accessToken, refreshToken } }
   * Mapped to client shape: data = user (public view)
   * Tokens are stored separately by AuthService.
   */
  async login({ email, password }) {
    const res = await this.client.post('/api/auth/login', { email, password });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const user = mapUserToClient(res.data.user);
    return {
      success: true,
      data: user,
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    };
  }

  /**
   * POST /api/auth/register
   * Server expects { name, email, password, role } with role = 'lecturer' | 'student'
   */
  async register(request) {
    const res = await this.client.post('/api/auth/register', {
      name: request.fullName,
      email: request.email,
      password: request.password,
      role: roleToServer(request.role),
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    this.notify.success('Registration successful');
    const user = mapUserToClient(res.data.user);
    return {
      success: true,
      data: user,
      accessToken: res.data.accessToken,
      refreshToken: null, // register doesn't return refresh token
    };
  }

  /**
   * POST /api/auth/logout
   */
  async logout(refreshToken) {
    await this.client.post('/api/auth/logout', {
      refreshToken: refreshToken || undefined,
    });
    // Always succeed on client side regardless of server response
  }

  /**
   * POST /api/auth/refresh-token
   */
  async refreshToken(token) {
    const res = await this.client.post('/api/auth/refresh-token', {
      refreshToken: token,
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: { accessToken: res.data.accessToken } };
  }

  /**
   * GET /api/auth/me
   */
  async getMe() {
    const res = await this.client.get('/api/auth/me');
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: mapUserToClient(res.data.user) };
  }

  /**
   * getUser(userId) — only works for current user via /api/auth/me.
   * Server doesn't expose a public user-by-id endpoint.
   */
  async getUser(_userId) {
    return this.getMe();
  }

  // ─── Exams (Lecturer) ─────────────────────────────────────────────────────

  /**
   * GET /api/exams — get all exams for the authenticated lecturer.
   * teacherId param is ignored (server uses the JWT token).
   */
  async getExamsByTeacher(_teacherId) {
    const res = await this.client.get('/api/exams');
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return {
      success: true,
      data: (res.data.exams || []).map(mapExamToClient),
    };
  }

  /**
   * GET /api/exams/:id
   */
  async getExam(examId) {
    const res = await this.client.get(`/api/exams/${examId}`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: mapExamToClient(res.data.exam) };
  }

  /**
   * POST /api/exams
   */
  async createExam(data) {
    const res = await this.client.post('/api/exams', mapExamToServer(data));
    if (!res.success) {
      return { success: false, error: res.error };
    }
    this.notify.success('Exam created');
    return { success: true, data: mapExamToClient(res.data.exam) };
  }

  /**
   * PUT /api/exams/:id
   */
  async updateExam(examId, patch) {
    const res = await this.client.put(`/api/exams/${examId}`, mapExamToServer(patch));
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: mapExamToClient(res.data.exam) };
  }

  /**
   * PATCH /api/exams/:id/status  { status: 'published' }
   */
  async publishExam(examId) {
    const res = await this.client.patch(`/api/exams/${examId}/status`, {
      status: 'published',
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    this.notify.success('Exam published');
    return { success: true, data: mapExamToClient(res.data.exam) };
  }

  /**
   * DELETE /api/exams/:id
   */
  async deleteExam(examId) {
    const res = await this.client.delete(`/api/exams/${examId}`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    this.notify.info('Exam deleted');
    return { success: true, data: true };
  }

  // ─── Questions (Lecturer) ─────────────────────────────────────────────────

  /**
   * GET /api/exams/:examId/questions
   */
  async getQuestionsByExam(examId) {
    const res = await this.client.get(`/api/exams/${examId}/questions`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return {
      success: true,
      data: (res.data.questions || []).map(mapQuestionToClient),
    };
  }

  /**
   * Save a question — create or update.
   * If data.id starts with 'q-' (local temp ID) → POST (create).
   * Otherwise → PUT (update).
   * Requires examId to be present on the data object.
   */
  async saveQuestion(data) {
    const examId = data.examId;
    const serverBody = mapQuestionToServer(data);
    const isNew = !data.id || data.id.startsWith('q-');

    let res;
    if (isNew) {
      res = await this.client.post(`/api/exams/${examId}/questions`, serverBody);
    } else {
      res = await this.client.put(`/api/exams/${examId}/questions/${data.id}`, serverBody);
    }

    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: mapQuestionToClient(res.data.question) };
  }

  /**
   * DELETE /api/exams/:examId/questions/:questionId
   * Requires examId — caller must provide it.
   */
  async deleteQuestion(questionId, examId) {
    if (!examId) {
      this.logger.error('deleteQuestion requires examId');
      return { success: false, error: 'examId is required to delete a question' };
    }
    const res = await this.client.delete(`/api/exams/${examId}/questions/${questionId}`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: true };
  }

  // ─── Student Exams ────────────────────────────────────────────────────────

  /**
   * GET /api/student/exams — all published exams
   */
  async getPublishedExams() {
    const res = await this.client.get('/api/student/exams');
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return {
      success: true,
      data: (res.data.exams || []).map(mapExamToClient),
    };
  }

  /**
   * GET /api/student/exams/:id — single exam with questions (no correct answers)
   */
  async getExamForStudent(examId) {
    const res = await this.client.get(`/api/student/exams/${examId}`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const exam = mapExamToClient(res.data.exam);
    // The server embeds questions directly in the exam response
    const questions = (res.data.exam.questions || []).map(mapQuestionToClient);
    return { success: true, data: { exam, questions } };
  }

  // ─── Student Submissions ──────────────────────────────────────────────────

  /**
   * POST /api/student/submissions — single-shot submit
   * Server expects { exam_id, answers: [{ question_id, answer }], time_spent_minutes }
   */
  async submitExam(examId, answers, timeSpentMinutes = 0) {
    const serverAnswers = answers.map((a) => ({
      question_id: a.questionId,
      answer: String(a.value),
    }));
    const res = await this.client.post('/api/student/submissions', {
      exam_id: examId,
      answers: serverAnswers,
      time_spent_minutes: timeSpentMinutes,
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    this.notify.success('Exam submitted successfully');
    return { success: true, data: mapSubmissionToClient(res.data.submission) };
  }

  /**
   * GET /api/student/submissions — all submissions by the current student
   * studentId param is ignored (server uses JWT).
   */
  async getSubmissionsByStudent(_studentId) {
    const res = await this.client.get('/api/student/submissions');
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return {
      success: true,
      data: (res.data.submissions || []).map(mapSubmissionToClient),
    };
  }

  /**
   * GET /api/student/submissions/:id
   */
  async getSubmissionById(submissionId) {
    const res = await this.client.get(`/api/student/submissions/${submissionId}`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: mapSubmissionToClient(res.data.submission) };
  }

  // ─── Student Drafts ───────────────────────────────────────────────────────

  /**
   * GET /api/student/exams/:id/draft
   */
  async getExamDraft(examId) {
    const res = await this.client.get(`/api/student/exams/${examId}/draft`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    // draft might be null if no draft exists
    const draft = res.data.draft;
    if (!draft) return { success: true, data: null };
    
    // Convert array of { question_id, answer } back to dictionary map if needed, 
    // or just return as is. Let's return the raw array.
    const clientAnswers = (draft.answers || []).map((a) => ({
      questionId: a.question_id,
      value: a.answer,
    }));
    return { success: true, data: clientAnswers };
  }

  /**
   * PUT /api/student/exams/:id/draft
   */
  async saveExamDraft(examId, answers) {
    const serverAnswers = answers.map((a) => ({
      question_id: a.questionId,
      answer: String(a.value),
    }));
    const res = await this.client.put(`/api/student/exams/${examId}/draft`, {
      answers: serverAnswers,
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: res.data.draft };
  }

  // ─── Lecturer Submissions ─────────────────────────────────────────────────

  /**
   * GET /api/lecturer/exams/:examId/submissions
   */
  async getSubmissionsByExam(examId) {
    const res = await this.client.get(`/api/lecturer/exams/${examId}/submissions`);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return {
      success: true,
      data: (res.data.submissions || []).map(mapSubmissionToClient),
    };
  }

  /**
   * GET /api/lecturer/submissions — all submissions for all lecturer exams
   */
  async getAllLecturerSubmissions() {
    const res = await this.client.get('/api/lecturer/submissions');
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return {
      success: true,
      data: (res.data.submissions || []).map(mapSubmissionToClient),
    };
  }

  /**
   * PATCH /api/lecturer/submissions/:id/grade
   */
  async gradeAnswer(submissionId, questionId, pointsEarned, feedback) {
    const res = await this.client.patch(`/api/lecturer/submissions/${submissionId}/grade`, {
      question_id: questionId,
      points_earned: pointsEarned,
      feedback: feedback,
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    this.notify.success('Grade updated successfully');
    return { success: true, data: mapSubmissionToClient(res.data.submission) };
  }

  // ─── Unsupported / Stub Methods ───────────────────────────────────────────
  // These existed in MockApiService but have no server endpoint.

  /**
   * getOrCreateSubmission — not supported by server.
   * Student flow changed to single-shot submit.
   */
  async getOrCreateSubmission(_examId, _studentId) {
    this.logger.warning('getOrCreateSubmission is not supported by the backend');
    return { success: false, error: 'Not supported — use submitExam instead' };
  }

  /**
   * saveAnswers — not supported by server.
   * Answers are kept in React state and submitted at once.
   */
  async saveAnswers(_submissionId, _answers) {
    this.logger.warning('saveAnswers is not supported by the backend');
    return { success: false, error: 'Not supported — use submitExam instead' };
  }

  /**
   * gradeSubmission — server auto-grades on submit.
   * No manual grading endpoint exists.
   */
  async gradeSubmission(_submissionId, _score, _feedback) {
    this.logger.warning('gradeSubmission is not supported — server auto-grades');
    return { success: false, error: 'Server auto-grades submissions' };
  }
}
