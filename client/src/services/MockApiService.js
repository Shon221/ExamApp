import {
  Exam,
  ExamStatus,
  Question,
  Submission,
  SubmissionStatus,
  User,
} from '../entities';
import { ConfigService } from './ConfigService';
import { LoggerService } from './LoggerService';
import { MockDatabase } from './MockDatabase';
import { NotifyService } from './NotifyService';

export class MockApiService {
  static instance = null;

  constructor() {
    this.db = MockDatabase.getInstance();
    this.config = ConfigService.getInstance();
    this.logger = LoggerService.getInstance();
    this.notify = NotifyService.getInstance();
  }

  static getInstance() {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  async simulateNetwork(operation) {
    const delay = this.config.get('mockDelayMs');
    await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const data = operation();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('MockApiService error', { message });
      return { success: false, error: message };
    }
  }

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  async login(request) {
    return this.simulateNetwork(() => {
      const user = this.db.users.find(
        (u) => u.email.toLowerCase() === request.email.toLowerCase() && u.password === request.password,
      );
      if (!user) throw new Error('Invalid email or password');
      this.logger.info('User logged in', { email: user.email });
      return user.toPublicView();
    });
  }

  async register(request) {
    return this.simulateNetwork(() => {
      const exists = this.db.users.some((u) => u.email.toLowerCase() === request.email.toLowerCase());
      if (exists) throw new Error('Email already registered');
      const user = User.fromData({
        id: this.generateId('u'),
        email: request.email,
        password: request.password,
        fullName: request.fullName,
        role: request.role,
      });
      this.db.users.push(user);
      this.notify.success('Registration successful');
      return user.toPublicView();
    });
  }

  async getExamsByTeacher(teacherId) {
    return this.simulateNetwork(() =>
      this.db.exams.filter((e) => e.teacherId === teacherId).map((e) => e.toData()),
    );
  }

  async getPublishedExams() {
    return this.simulateNetwork(() =>
      this.db.exams.filter((e) => e.status === ExamStatus.Published).map((e) => e.toData()),
    );
  }

  async getExam(examId) {
    return this.simulateNetwork(() => {
      const exam = this.db.exams.find((e) => e.id === examId);
      if (!exam) throw new Error('Exam not found');
      return exam.toData();
    });
  }

  async createExam(data) {
    return this.simulateNetwork(() => {
      const exam = Exam.fromData({
        ...data,
        id: this.generateId('exam'),
        createdAt: new Date().toISOString(),
      });
      this.db.exams.push(exam);
      this.notify.success('Exam created');
      return exam.toData();
    });
  }

  async updateExam(examId, patch) {
    return this.simulateNetwork(() => {
      const index = this.db.exams.findIndex((e) => e.id === examId);
      if (index === -1) throw new Error('Exam not found');
      const current = this.db.exams[index].toData();
      const updated = Exam.fromData({ ...current, ...patch, id: examId });
      this.db.exams[index] = updated;
      return updated.toData();
    });
  }

  async publishExam(examId) {
    return this.simulateNetwork(() => {
      const index = this.db.exams.findIndex((e) => e.id === examId);
      if (index === -1) throw new Error('Exam not found');
      const exam = this.db.exams[index];
      exam.status = ExamStatus.Published;
      exam.publishedAt = new Date().toISOString();
      this.notify.success('Exam published');
      return exam.toData();
    });
  }

  async deleteExam(examId) {
    return this.simulateNetwork(() => {
      const before = this.db.exams.length;
      this.db.exams = this.db.exams.filter((e) => e.id !== examId);
      this.db.questions = this.db.questions.filter((q) => q.examId !== examId);
      if (this.db.exams.length === before) throw new Error('Exam not found');
      this.notify.info('Exam deleted');
      return true;
    });
  }

  async getQuestionsByExam(examId) {
    return this.simulateNetwork(() =>
      this.db.questions
        .filter((q) => q.examId === examId)
        .sort((a, b) => a.order - b.order)
        .map((q) => q.toData()),
    );
  }

  async saveQuestion(data) {
    return this.simulateNetwork(() => {
      const index = this.db.questions.findIndex((q) => q.id === data.id);
      const question = Question.fromData(data);
      if (index >= 0) {
        this.db.questions[index] = question;
      } else {
        this.db.questions.push(question);
      }
      return question.toData();
    });
  }

  async deleteQuestion(questionId) {
    return this.simulateNetwork(() => {
      const before = this.db.questions.length;
      this.db.questions = this.db.questions.filter((q) => q.id !== questionId);
      if (this.db.questions.length === before) throw new Error('Question not found');
      return true;
    });
  }

  async getSubmissionsByExam(examId) {
    return this.simulateNetwork(() =>
      this.db.submissions.filter((s) => s.examId === examId).map((s) => s.toData()),
    );
  }

  async getSubmissionsByStudent(studentId) {
    return this.simulateNetwork(() =>
      this.db.submissions.filter((s) => s.studentId === studentId).map((s) => s.toData()),
    );
  }

  async getOrCreateSubmission(examId, studentId) {
    return this.simulateNetwork(() => {
      let submission = this.db.submissions.find(
        (s) => s.examId === examId && s.studentId === studentId,
      );
      if (!submission) {
        submission = Submission.fromData({
          id: this.generateId('sub'),
          examId,
          studentId,
          answers: [],
          status: SubmissionStatus.InProgress,
        });
        this.db.submissions.push(submission);
      }
      return submission.toData();
    });
  }

  async saveAnswers(submissionId, answers) {
    return this.simulateNetwork(() => {
      const index = this.db.submissions.findIndex((s) => s.id === submissionId);
      if (index === -1) throw new Error('Submission not found');
      this.db.submissions[index].answers = answers;
      return this.db.submissions[index].toData();
    });
  }

  async submitExam(submissionId) {
    return this.simulateNetwork(() => {
      const index = this.db.submissions.findIndex((s) => s.id === submissionId);
      if (index === -1) throw new Error('Submission not found');
      const submission = this.db.submissions[index];
      submission.status = SubmissionStatus.Submitted;
      submission.submittedAt = new Date().toISOString();
      this.notify.success('Exam submitted successfully');
      return submission.toData();
    });
  }

  async gradeSubmission(submissionId, score, feedback) {
    return this.simulateNetwork(() => {
      const index = this.db.submissions.findIndex((s) => s.id === submissionId);
      if (index === -1) throw new Error('Submission not found');
      const submission = this.db.submissions[index];
      submission.status = SubmissionStatus.Graded;
      submission.score = score;
      submission.feedback = feedback;
      this.notify.success('Grade published');
      return submission.toData();
    });
  }

  async getUser(userId) {
    return this.simulateNetwork(() => {
      const user = this.db.users.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      return user.toPublicView();
    });
  }
}
