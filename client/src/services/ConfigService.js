// שירות תצורה - ניהול הגדרות גלובליות של האפליקציה
class ConfigService {
  // Private field - עריכה פנימית של התצורה (לא ניתן לגשת אליה מבחוץ)
  #config;

  constructor() {
    // הגדרת התצורה בהתאם ל-environment (development/production)
    this.#config = {
      // URL של ה-API - שונה בהתאם לסביבה
      apiUrl: import.meta.env?.MODE === 'production'
        ? 'https://exam-app-api.onrender.com/api'
        : 'http://localhost:5000/api',
      // גרסת האפליקציה
      appVersion: '1.0.0',
      // סביבת הריצה (development / production)
      environment: import.meta.env?.MODE || 'development',
      // זמן timeout לבקשות (במילישניות)
      timeout: 5000
    };
  }

  /**
   * קבלת ערך תצורה ספציפי לפי מפתח (safely)
   * @param {string} key - המפתח של הערך
   * @returns {*} הערך המבוקש
   */
  get(key) {
    return this.#config[key];
  }

  /**
   * שינוי דינמי של ערך תצורה
   * @param {string} key - המפתח של הערך שרוצים לשנות
   * @param {*} value - הערך החדש
   */
  set(key, value) {
    this.#config[key] = value;
  }

  /**
   * קבלת העתק של כל התצורה (read-only)
   * @returns {Object} עותק מקופא של התצורה
   */
  getAll() {
    return Object.freeze({ ...this.#config });
  }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const configService = new ConfigService();
Object.freeze(configService);
export default configService;
