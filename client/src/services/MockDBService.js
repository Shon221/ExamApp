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

  // הרשמה - יצירת משתמש חדש וההתחברות אוטומטית
  async register(name, email, password, role) {
    await this._simulateNetwork();

    // בדיקה שהדוא"ל לא קיים כבר
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('דוא"ל זה כבר רשום במערכת');
    }

    // יצירת משתמש חדש
    const newUser = {
      id: 'u' + (this.users.length + 1),
      name,
      email,
      password,
      role
    };

    // הוספה לרשימה
    this.users.push(newUser);

    // החזרת משתמש ללא סיסמה וטוקן
    const { password: _, ...userSafe } = newUser;
    return {
      user: userSafe,
      token: 'mock-jwt-token-' + Math.random().toString(36).substr(2)
    };
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

  /**
   * Updates an existing exam by its ID.
   * @param {string} id - The ID of the exam to update.
   * @param {Object} updatedData - The new data for the exam.
   * @returns {Promise<Object>} The updated exam object.
   */
  async updateExam(id, updatedData) {
    await this._simulateNetwork();
    const index = this.exams.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Exam not found');
    this.exams[index] = { ...this.exams[index], ...updatedData };
    return this.exams[index];
  }

  /**
   * Updates the status of an existing exam.
   * @param {string} id - The ID of the exam.
   * @param {string} newStatus - The new status (e.g., 'Published', 'Draft').
   * @returns {Promise<Object>} The updated exam object.
   */
  async updateExamStatus(id, newStatus) {
    await this._simulateNetwork();
    const exam = this.exams.find(e => e.id === id);
    if (!exam) throw new Error('Exam not found');
    exam.status = newStatus;
    return exam;
  }

  /**
   * Retrieves all exams marked as 'Published'.
   * @returns {Promise<Array>} A list of published exams (summary only).
   */
  async getPublishedExams() {
    await this._simulateNetwork();
    return this.exams
      .filter(e => e.status === 'Published')
      .map(({ id, title, instructions }) => ({ id, title, instructions }));
  }

  /**
   * Creates a new exam and adds it to the mock database.
   * @param {Object} examData - The data for the new exam.
   * @returns {Promise<Object>} The created exam object with a new ID.
   */
  async createExam(examData) {
    await this._simulateNetwork();
    const newExam = {
      ...examData,
      id: 'e' + (this.exams.length + 1)
    };
    this.exams.push(newExam);
    return newExam;
  }

  /**
   * Submits exam answers from a student and calculates a mock score.
   * @param {Object} submissionData - The student's answers and metadata.
   * @returns {Promise<Object>} The submission result including a random score.
   */
  async submitExam(submissionData) {
    await this._simulateNetwork();
    const score = Math.floor(Math.random() * 41) + 60;
    const submission = {
      ...submissionData,
      id: 's' + (this.submissions.length + 1),
      submittedAt: new Date().toISOString(),
      score: score
    };
    this.submissions.push(submission);
    return submission;
  }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const mockDBService = new MockDBService();
Object.freeze(mockDBService);
export default mockDBService;
