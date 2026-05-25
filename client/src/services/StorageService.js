// שירות אחסון נתונים - מטפל בשמירה וקריאה של נתונים מה-localStorage
class StorageService {
  // בנאי - מקבל storage (ברירת מחדל: localStorage)
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  // שמירת נתונים עם serialization - המרה ל-JSON ושמירה באחסון
  save(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  }

  // קריאת נתונים עם deserialization - המרה חזרה מ-JSON לאובייקט
  retrieve(key) {
    try {
      const serializedValue = this.storage.getItem(key);
      if (serializedValue === null) return null;
      return JSON.parse(serializedValue);
    } catch (e) {
      console.error('Error retrieving from storage', e);
      return null;
    }
  }

  // הסרת ערך ספציפי מה-storage
  remove(key) {
    this.storage.removeItem(key);
  }

  // ניקוי כל הנתונים מה-storage
  clear() {
    this.storage.clear();
  }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const storageService = new StorageService();
Object.freeze(storageService);
export default storageService;
