// שירות להודעות - מטפל בהצגת הודעות הצלחה ושגיאה למשתמש
class NotifyService {
  // הצגת הודעת הצלחה בירוק בקונסול ודרך alert
  success(message) {
    console.log(`%c SUCCESS: ${message}`, 'color: green; font-weight: bold;');
    alert(`Success: ${message}`);
  }

  // הצגת הודעת שגיאה באדום בקונסול ודרך alert
  error(message) {
    console.log(`%c ERROR: ${message}`, 'color: red; font-weight: bold;');
    alert(`Error: ${message}`);
  }
}

// יצירת instance יחיד (Singleton) וקפיאתו כדי למנוע שינויים
const notifyService = new NotifyService();
Object.freeze(notifyService);
export default notifyService;
