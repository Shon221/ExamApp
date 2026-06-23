export class NotifyService {
  static instance = null;

  constructor() {
    this.notifications = [];
    this.listeners = new Set();
    this.idCounter = 0;
  }

  static getInstance() {
    if (!NotifyService.instance) {
      NotifyService.instance = new NotifyService();
    }
    return NotifyService.instance;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener([...this.notifications]);
    return () => this.listeners.delete(listener);
  }

  success(message) {
    this.push('success', message);
  }

  error(message) {
    this.push('error', message);
  }

  info(message) {
    this.push('info', message);
  }

  warning(message) {
    this.push('warning', message);
  }

  dismiss(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.emit();
  }

  push(type, message) {
    const notification = {
      id: `notify-${++this.idCounter}`,
      type,
      message,
      createdAt: Date.now(),
    };
    this.notifications = [...this.notifications, notification];
    this.emit();
    setTimeout(() => this.dismiss(notification.id), 5000);
  }

  emit() {
    const snapshot = [...this.notifications];
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
