// שירות רישום לוג - מטפל בהדפסת הודעות לוג עם timestamp
class LoggerService {
  // פורמט הודעה - מוסיף timestamp וסוג ההודעה
  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  // הדפסת הודעה מידע
  info(message) {
    console.info(this.formatMessage('info', message));
  }

  // הדפסת הודעת אזהרה
  warn(message) {
    console.warn(this.formatMessage('warn', message));
  }

  // הדפסת הודעת שגיאה
  error(message) {
    console.error(this.formatMessage('error', message));
  }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const loggerService = new LoggerService();
Object.freeze(loggerService);
export default loggerService;
