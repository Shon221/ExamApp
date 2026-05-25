// שירות התחברות - ניהול משתמשים, tokens ו-sessions
import validationService from './ValidationService.js';
import storageService from './StorageService.js';
import mockDBService from './MockDBService.js';

class AuthService {
    // חנות של משתמש מחובר כרגע (null אם לא מחובר)
    #currentUser = null;

    // token של המשתמש המחובר
    #token = null;

    // קלט לשמירת מצב בlocal storage
    #storageKey = 'exam_auth';

    constructor() {
        // טעינת סשן קיים מ-storage בעת אתחול
        this.#loadSessionFromStorage();
    }

    /**
     * טעינת סשן קיים מ-local storage (אם קיים)
     * @private
     */
    #loadSessionFromStorage() {
        try {
            const storedAuth = storageService.retrieve(this.#storageKey);
            if (storedAuth && storedAuth.user && storedAuth.token) {
                this.#currentUser = storedAuth.user;
                this.#token = storedAuth.token;
            }
        } catch (error) {
            console.error('Error loading session from storage:', error);
        }
    }

    /**
     * שמירת סשן ל-local storage
     * @private
     */
    #saveSessionToStorage() {
        try {
            storageService.save(this.#storageKey, {
                user: this.#currentUser,
                token: this.#token
            });
        } catch (error) {
            console.error('Error saving session to storage:', error);
        }
    }

    /**
     * ניקוי הסשן בלוקל סטוריג'
     * @private
     */
    #clearSessionFromStorage() {
        try {
            storageService.remove(this.#storageKey);
        } catch (error) {
            console.error('Error clearing session from storage:', error);
        }
    }

    /**
     * התחברות משתמש
     * @param {string} email - דוא"ל של המשתמש
     * @param {string} password - סיסמה של המשתמש
     * @returns {Promise<Object>} {success: boolean, user: Object, message: string}
     */
    async login(email, password) {
        try {
            // אימות נתונים
            const validation = validationService.validateLoginForm({ email, password });
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message
                };
            }

            // קריאה ל-MockDBService לאימות
            const result = await mockDBService.login(email, password);

            // שמירת משתמש וtoken
            this.#currentUser = result.user;
            this.#token = result.token;

            // שמירה ב-storage
            this.#saveSessionToStorage();

            return {
                success: true,
                user: this.#currentUser,
                message: `ברוכים הבאים, ${this.#currentUser.name}`
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'שגיאה בהתחברות'
            };
        }
    }

    /**
     * הרשמה של משתמש חדש
     * @param {string} name - שם המשתמש
     * @param {string} email - דוא"ל
     * @param {string} password - סיסמה
     * @param {string} role - תפקיד (student/lecturer)
     * @returns {Promise<Object>} {success: boolean, user: Object, message: string}
     */
    async register(name, email, password, role) {
        try {
            // אימות נתונים
            const validation = validationService.validateRegisterForm({
                name,
                email,
                password,
                role
            });
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message
                };
            }

            // קריאה ל-MockDBService להרשמה
            const result = await mockDBService.register(name, email, password, role);

            // התחברות אוטומטית אחרי הרשמה
            this.#currentUser = result.user;
            this.#token = result.token;

            // שמירה ב-storage
            this.#saveSessionToStorage();

            return {
                success: true,
                user: this.#currentUser,
                message: `הרשמה בוצעה בהצלחה, ברוכים הבאים ${name}`
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'שגיאה בהרשמה'
            };
        }
    }

    /**
     * התנתקות משתמש
     * @returns {Object} {success: boolean, message: string}
     */
    logout() {
        try {
            // ניקוי משתמש וtoken
            this.#currentUser = null;
            this.#token = null;

            // ניקוי מ-storage
            this.#clearSessionFromStorage();

            return {
                success: true,
                message: 'התנתקתם בהצלחה'
            };
        } catch (error) {
            return {
                success: false,
                message: 'שגיאה בהתנתקות'
            };
        }
    }

    /**
     * קבלת המשתמש המחובר כרגע
     * @returns {Object|null} משתמש או null
     */
    getCurrentUser() {
        return this.#currentUser;
    }

    /**
     * קבלת ה-token של המשתמש המחובר
     * @returns {string|null} token או null
     */
    getToken() {
        return this.#token;
    }

    /**
     * בדיקה אם משתמש מחובר
     * @returns {boolean} true אם מחובר
     */
    isAuthenticated() {
        return this.#currentUser !== null && this.#token !== null;
    }

    /**
     * בדיקה אם המשתמש המחובר הוא מרצה (lecturer)
     * @returns {boolean} true אם מרצה
     */
    isLecturer() {
        return this.isAuthenticated() && this.#currentUser.role === 'lecturer';
    }

    /**
     * בדיקה אם המשתמש המחובר הוא סטודנט
     * @returns {boolean} true אם סטודנט
     */
    isStudent() {
        return this.isAuthenticated() && this.#currentUser.role === 'student';
    }

    /**
     * קבלת שם המשתמש המחובר
     * @returns {string|null} שם המשתמש או null
     */
    getUserName() {
        return this.#currentUser ? this.#currentUser.name : null;
    }

    /**
     * קבלת דוא"ל המשתמש המחובר
     * @returns {string|null} דוא"ל או null
     */
    getUserEmail() {
        return this.#currentUser ? this.#currentUser.email : null;
    }

    /**
     * קבלת תפקיד המשתמש המחובר
     * @returns {string|null} תפקיד או null
     */
    getUserRole() {
        return this.#currentUser ? this.#currentUser.role : null;
    }

    /**
     * עדכון ה-token (renewal)
     * @param {string} newToken - ה-token החדש
     * @returns {boolean} true אם עודכן בהצלחה
     */
    refreshToken(newToken) {
        if (!newToken || typeof newToken !== 'string') {
            return false;
        }

        this.#token = newToken;
        this.#saveSessionToStorage();
        return true;
    }

    /**
     * בדיקה אם token תקף (בעתיד יהיה בדיקת expiration)
     * @returns {boolean} true אם token תקף
     */
    isTokenValid() {
        return this.#token !== null;
    }

    /**
     * קבלת כל מידע המשתמש המחובר
     * @returns {Object|null} אובייקט המשתמש או null
     */
    getUserInfo() {
        if (!this.isAuthenticated()) {
            return null;
        }

        return {
            id: this.#currentUser.id,
            name: this.#currentUser.name,
            email: this.#currentUser.email,
            role: this.#currentUser.role,
            isLecturer: this.isLecturer(),
            isStudent: this.isStudent()
        };
    }

    /**
     * עדכון פרטי משתמש (למעשה - עדכון המשתמש המחובר בזיכרון)
     * @param {Object} userData - הנתונים החדשים
     * @returns {boolean} true אם עודכן בהצלחה
     */
    updateUserInfo(userData) {
        if (!this.isAuthenticated() || !userData || typeof userData !== 'object') {
            return false;
        }

        // עדכון שדות אם הם סופקו
        if (userData.name) {
            this.#currentUser.name = userData.name;
        }
        if (userData.email) {
            this.#currentUser.email = userData.email;
        }

        // שמירה ב-storage
        this.#saveSessionToStorage();
        return true;
    }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const authService = new AuthService();
Object.freeze(authService);
export default authService;
