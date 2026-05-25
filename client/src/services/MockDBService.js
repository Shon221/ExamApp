// שירות מסד נתונים מדומה - משחקת תפקיד של API לצורך פיתוח ובדיקות
class MockDBService {
  constructor() {
    // רשימת משתמשים (מרצים וסטודנטים)
    this.users = [
      { id: 'u1', name: 'Dr. Smith', email: 'teacher@exam.com', password: 'password123', role: 'lecturer' },
      { id: 'u2', name: 'Alice Student', email: 'student@exam.com', password: 'password123', role: 'student' }
    ];

    // רשימת בחינות עם שאלות
    this.exams = [
      {
        id: 'e1',
        title: 'JavaScript Fundamentals',
        instructions: 'Answer all questions. Time limit: 60 mins.',
        status: 'Published',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            text: 'Which keyword is used to declare a constant in JS?',
            options: ['var', 'let', 'const', 'constant']
          },
          {
            id: 'q2',
            type: 'open-ended',
            text: 'Explain the concept of closures in JavaScript.'
          }
        ]
      }
    ];

    // רשימת הגשות של בחינות על ידי סטודנטים
    this.submissions = [];
    // השהיה מדומה לסימולציה של קריאה לרשת (בודקת חוקיות async/await)
    this.delay = 800; // Simulated network delay in ms
  }

  // עזר לסימולציה של השהיית רשת (כדי לתרגל async/await)
  _simulateNetwork() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  // התחברות - בדיקת דוא"ל וסיסמה, החזרת משתמש וטוקן מדומה
  async login(email, password) {
    await this._simulateNetwork();
    const user = this.users.find(u => u.email === email && u.password === password);

    if (user) {
      // החזרת משתמש ללא סיסמה (כי לא מחזירים סיסמאות לקליינט)
      const { password, ...userSafe } = user;
      return {
        user: userSafe,
        token: 'mock-jwt-token-' + Math.random().toString(36).substr(2)
      };
    }
    throw new Error('Invalid credentials');
  }

  // קבלת רשימת כל הבחינות (סיכום בלבד - ללא שאלות מלאות)
  async getExams() {
    await this._simulateNetwork();
    // החזרת רק פרטים חיוניים - id, title, status
    return this.exams.map(({ id, title, status }) => ({ id, title, status }));
  }

  // קבלת בחינה ספציפית לפי ID (כולל כל השאלות)
  async getExamById(id) {
    await this._simulateNetwork();
    const exam = this.exams.find(e => e.id === id);
    if (!exam) throw new Error('Exam not found');
    return { ...exam };
  }

  // יצירת בחינה חדשה וסיוכה לרשימה
  async createExam(examData) {
    await this._simulateNetwork();
    const newExam = {
      ...examData,
      id: 'e' + (this.exams.length + 1)
    };
    this.exams.push(newExam);
    return newExam;
  }

  // הגשת בחינה על ידי סטודנט - שמירת התשובות עם timestamp
  async submitExam(submissionData) {
    await this._simulateNetwork();
    const submission = {
      ...submissionData,
      id: 's' + (this.submissions.length + 1),
      submittedAt: new Date().toISOString()
    };
    this.submissions.push(submission);
    return submission;
  }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const mockDBService = new MockDBService();
Object.freeze(mockDBService);
export default mockDBService;
