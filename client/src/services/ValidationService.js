// שירות אימות - בדיקת תקינות של נתונים בטופסים ובעצמים
class ValidationService {
    // ביטוי רגולרי לבדיקת דוא"ל
    #emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ביטוי רגולרי לבדיקת סיסמה - לפחות 8 תווים, אות גדולה, מספר
    #passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    // ביטוי רגולרי לבדיקת טלפון
    #phoneRegex = /^[0-9]{9,15}$/;

    /**
     * בדיקת תקינות דוא"ל
     * @param {string} email - כתובת דוא"ל
     * @returns {Object} {valid: boolean, message: string}
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return {
                valid: false,
                message: 'דוא"ל הוא שדה חובה'
            };
        }

        if (!this.#emailRegex.test(email)) {
            return {
                valid: false,
                message: 'דוא"ל לא תקין - יש להזין כתובת דוא"ל חוקית'
            };
        }

        return { valid: true, message: 'דוא"ל תקין' };
    }

    /**
     * בדיקת תקינות סיסמה
     * @param {string} password - סיסמה
     * @returns {Object} {valid: boolean, message: string}
     */
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return {
                valid: false,
                message: 'סיסמה היא שדה חובה'
            };
        }

        if (password.length < 8) {
            return {
                valid: false,
                message: 'סיסמה חייבת להיות לפחות 8 תווים'
            };
        }

        if (!/[A-Z]/.test(password)) {
            return {
                valid: false,
                message: 'סיסמה חייבת להכיל לפחות אות גדולה'
            };
        }

        if (!/\d/.test(password)) {
            return {
                valid: false,
                message: 'סיסמה חייבת להכיל לפחות מספר'
            };
        }

        return { valid: true, message: 'סיסמה תקינה' };
    }

    /**
     * בדיקת תקינות שם משתמש
     * @param {string} name - שם
     * @returns {Object} {valid: boolean, message: string}
     */
    validateName(name) {
        if (!name || typeof name !== 'string') {
            return {
                valid: false,
                message: 'שם הוא שדה חובה'
            };
        }

        if (name.trim().length < 2) {
            return {
                valid: false,
                message: 'שם חייב להיות לפחות 2 תווים'
            };
        }

        if (name.length > 50) {
            return {
                valid: false,
                message: 'שם לא יכול להיות יותר מ-50 תווים'
            };
        }

        return { valid: true, message: 'שם תקין' };
    }

    /**
     * בדיקת תקינות כותרת בחינה
     * @param {string} title - כותרת הבחינה
     * @returns {Object} {valid: boolean, message: string}
     */
    validateExamTitle(title) {
        if (!title || typeof title !== 'string') {
            return {
                valid: false,
                message: 'כותרת בחינה היא שדה חובה'
            };
        }

        if (title.trim().length === 0) {
            return {
                valid: false,
                message: 'כותרת בחינה היא שדה חובה'
            };
        }

        if (title.length > 100) {
            return {
                valid: false,
                message: 'כותרת בחינה לא יכולה להיות יותר מ-100 תווים'
            };
        }

        return { valid: true, message: 'כותרת בחינה תקינה' };
    }

    /**
     * בדיקת תקינות שאלה בבחינה
     * @param {Object} question - אובייקט השאלה
     * @returns {Object} {valid: boolean, message: string}
     */
    validateQuestion(question) {
        if (!question || typeof question !== 'object') {
            return {
                valid: false,
                message: 'שאלה חייבת להיות אובייקט'
            };
        }

        if (!question.text || question.text.trim().length === 0) {
            return {
                valid: false,
                message: 'טקסט השאלה הוא שדה חובה'
            };
        }

        if (question.text.length > 500) {
            return {
                valid: false,
                message: 'טקסט השאלה לא יכול להיות יותר מ-500 תווים'
            };
        }

        // בדיקת סוג השאלה
        const validTypes = ['multiple-choice', 'open-ended', 'true-false'];
        if (!validTypes.includes(question.type)) {
            return {
                valid: false,
                message: `סוג השאלה לא תקין. חייב להיות אחד מ: ${validTypes.join(', ')}`
            };
        }

        // אם זו שאלת multiple choice, בדיקת אפשרויות
        if (question.type === 'multiple-choice') {
            if (!question.options || !Array.isArray(question.options)) {
                return {
                    valid: false,
                    message: 'שאלת multiple choice חייבת להכיל מערך של אפשרויות'
                };
            }

            if (question.options.length < 2) {
                return {
                    valid: false,
                    message: 'שאלת multiple choice חייבת להכיל לפחות 2 אפשרויות'
                };
            }

            if (question.options.length > 10) {
                return {
                    valid: false,
                    message: 'שאלת multiple choice לא יכולה להכיל יותר מ-10 אפשרויות'
                };
            }
        }

        return { valid: true, message: 'שאלה תקינה' };
    }

    /**
     * בדיקת תקינות בחינה שלמה
     * @param {Object} exam - אובייקט הבחינה
     * @returns {Object} {valid: boolean, message: string}
     */
    validateExam(exam) {
        if (!exam || typeof exam !== 'object') {
            return {
                valid: false,
                message: 'בחינה חייבת להיות אובייקט'
            };
        }

        // בדיקת כותרת
        const titleValidation = this.validateExamTitle(exam.title);
        if (!titleValidation.valid) {
            return titleValidation;
        }

        // בדיקת שאלות
        if (!exam.questions || !Array.isArray(exam.questions)) {
            return {
                valid: false,
                message: 'בחינה חייבת להכיל מערך של שאלות'
            };
        }

        if (exam.questions.length === 0) {
            return {
                valid: false,
                message: 'בחינה חייבת להכיל לפחות שאלה אחת'
            };
        }

        if (exam.questions.length > 100) {
            return {
                valid: false,
                message: 'בחינה לא יכולה להכיל יותר מ-100 שאלות'
            };
        }

        // בדיקת כל שאלה
        for (let i = 0; i < exam.questions.length; i++) {
            const questionValidation = this.validateQuestion(exam.questions[i]);
            if (!questionValidation.valid) {
                return {
                    valid: false,
                    message: `שאלה ${i + 1}: ${questionValidation.message}`
                };
            }
        }

        // בדיקת הוראות (אופציונלי)
        if (exam.instructions && exam.instructions.length > 500) {
            return {
                valid: false,
                message: 'הוראות לא יכולות להיות יותר מ-500 תווים'
            };
        }

        // בדיקת סטטוס
        const validStatuses = ['Draft', 'Published', 'Archived'];
        if (exam.status && !validStatuses.includes(exam.status)) {
            return {
                valid: false,
                message: `סטטוס לא תקין. חייב להיות אחד מ: ${validStatuses.join(', ')}`
            };
        }

        return { valid: true, message: 'בחינה תקינה' };
    }

    /**
     * בדיקת תקינות טופס התחברות
     * @param {Object} loginData - {email, password}
     * @returns {Object} {valid: boolean, message: string}
     */
    validateLoginForm(loginData) {
        if (!loginData || typeof loginData !== 'object') {
            return {
                valid: false,
                message: 'נתוני ההתחברות חייבים להיות אובייקט'
            };
        }

        const emailValidation = this.validateEmail(loginData.email);
        if (!emailValidation.valid) {
            return emailValidation;
        }

        if (!loginData.password || loginData.password.length === 0) {
            return {
                valid: false,
                message: 'סיסמה היא שדה חובה'
            };
        }

        return { valid: true, message: 'טופס התחברות תקין' };
    }

    /**
     * בדיקת תקינות טופס הרשמה
     * @param {Object} registerData - {email, password, name, role}
     * @returns {Object} {valid: boolean, message: string}
     */
    validateRegisterForm(registerData) {
        if (!registerData || typeof registerData !== 'object') {
            return {
                valid: false,
                message: 'נתוני ההרשמה חייבים להיות אובייקט'
            };
        }

        const nameValidation = this.validateName(registerData.name);
        if (!nameValidation.valid) {
            return nameValidation;
        }

        const emailValidation = this.validateEmail(registerData.email);
        if (!emailValidation.valid) {
            return emailValidation;
        }

        const passwordValidation = this.validatePassword(registerData.password);
        if (!passwordValidation.valid) {
            return passwordValidation;
        }

        // בדיקת תפקיד
        const validRoles = ['student', 'lecturer'];
        if (!registerData.role || !validRoles.includes(registerData.role)) {
            return {
                valid: false,
                message: `תפקיד לא תקין. חייב להיות אחד מ: ${validRoles.join(', ')}`
            };
        }

        return { valid: true, message: 'טופס הרשמה תקין' };
    }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const validationService = new ValidationService();
Object.freeze(validationService);
export default validationService;
