import {
  Exam,
  ExamStatus,
  Question,
  QuestionType,
  Submission,
  SubmissionStatus,
  User,
  UserRole,
} from '../entities';

export class MockDatabase {
  static instance = null;

  constructor() {
    this.users = [];
    this.exams = [];
    this.questions = [];
    this.submissions = [];
    this.seed();
  }

  static getInstance() {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  reset() {
    this.users = [];
    this.exams = [];
    this.questions = [];
    this.submissions = [];
    this.seed();
  }

  seed() {
    const teacher = User.fromData({
      id: 'u-teacher-1',
      email: 'teacher@exam.com',
      password: 'teacher123',
      fullName: 'Dr. Sarah Cohen',
      role: UserRole.Teacher,
    });
    const student1 = User.fromData({
      id: 'u-student-1',
      email: 'student@exam.com',
      password: 'student123',
      fullName: 'Yossi Levi',
      role: UserRole.Student,
    });
    const student2 = User.fromData({
      id: 'u-student-2',
      email: 'maya@exam.com',
      password: 'student123',
      fullName: 'Maya Bar',
      role: UserRole.Student,
    });
    this.users.push(teacher, student1, student2);

    const exam1 = Exam.fromData({
      id: 'exam-1',
      title: 'Introduction to Algorithms',
      description: 'Midterm covering sorting, graphs, and complexity.',
      teacherId: teacher.id,
      status: ExamStatus.Published,
      durationMinutes: 90,
      createdAt: '2026-01-10T08:00:00Z',
      publishedAt: '2026-01-15T10:00:00Z',
    });
    const exam2 = Exam.fromData({
      id: 'exam-2',
      title: 'Database Systems Quiz',
      description: 'SQL, normalization, and indexing fundamentals.',
      teacherId: teacher.id,
      status: ExamStatus.Draft,
      durationMinutes: 45,
      createdAt: '2026-02-01T09:00:00Z',
    });
    this.exams.push(exam1, exam2);

    this.questions.push(
      Question.fromData({
        id: 'q-1',
        examId: exam1.id,
        text: 'What is the average time complexity of QuickSort?',
        type: QuestionType.MultipleChoice,
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 'O(n log n)',
        points: 10,
        order: 1,
      }),
      Question.fromData({
        id: 'q-2',
        examId: exam1.id,
        text: 'BFS uses a stack data structure.',
        type: QuestionType.TrueFalse,
        correctAnswer: 'false',
        points: 5,
        order: 2,
      }),
      Question.fromData({
        id: 'q-3',
        examId: exam1.id,
        text: 'Explain the difference between DFS and BFS.',
        type: QuestionType.OpenText,
        points: 15,
        order: 3,
      }),
      Question.fromData({
        id: 'q-4',
        examId: exam2.id,
        text: 'Which normal form eliminates transitive dependencies?',
        type: QuestionType.MultipleChoice,
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: '3NF',
        points: 10,
        order: 1,
      }),
    );

    this.submissions.push(
      Submission.fromData({
        id: 'sub-1',
        examId: exam1.id,
        studentId: student1.id,
        answers: [
          { questionId: 'q-1', value: 'O(n log n)' },
          { questionId: 'q-2', value: 'false' },
          { questionId: 'q-3', value: 'DFS goes deep; BFS explores level by level.' },
        ],
        status: SubmissionStatus.Graded,
        submittedAt: '2026-01-20T14:30:00Z',
        score: 28,
        feedback: 'Strong understanding of graph traversal.',
      }),
    );
  }
}
