// שירות תצורה - מטפל בהגדרות האפליקציה והערכים הגלובליים
class ConfigurationService {
  // בנאי - אתחול הגדרות מ-environment variables או ערכי ברירת מחדל
  constructor() {
    this.config = {
      // URL של ה-API - נלקח מ-environment או ברירת מחדל localhost
      apiUrl: import.meta.env?.VITE_API_URL || 'http://localhost:3000/api',
      // סביבת ריצה - development/production
      environment: import.meta.env?.MODE || 'development',
      // שם האפליקציה
      appName: 'ExamApp'
    };
  }

  // קבלת ערך תצורה ספציפי לפי מפתח
  get(key) {
    return this.config[key];
  }

  // קבלת כל ערכי התצורה כ-copy (כדי למנוע שינויים ישירים)
  getAll() {
    return { ...this.config };
  }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const configurationService = new ConfigurationService();
Object.freeze(configurationService);
export default configurationService;
