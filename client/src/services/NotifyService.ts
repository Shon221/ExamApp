export type NotifyType = 'success' | 'error' | 'info' | 'warning';

export interface INotification {
  id: string;
  type: NotifyType;
  message: string;
  createdAt: number;
}

type NotifyListener = (notifications: INotification[]) => void;

export class NotifyService {
  private static instance: NotifyService | null = null;
  private notifications: INotification[] = [];
  private listeners: Set<NotifyListener> = new Set();
  private idCounter = 0;

  private constructor() {}

  static getInstance(): NotifyService {
    if (!NotifyService.instance) {
      NotifyService.instance = new NotifyService();
    }
    return NotifyService.instance;
  }

  subscribe(listener: NotifyListener): () => void {
    this.listeners.add(listener);
    listener([...this.notifications]);
    return () => this.listeners.delete(listener);
  }

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  warning(message: string): void {
    this.push('warning', message);
  }

  dismiss(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.emit();
  }

  private push(type: NotifyType, message: string): void {
    const notification: INotification = {
      id: `notify-${++this.idCounter}`,
      type,
      message,
      createdAt: Date.now(),
    };
    this.notifications = [...this.notifications, notification];
    this.emit();
    setTimeout(() => this.dismiss(notification.id), 5000);
  }

  private emit(): void {
    const snapshot = [...this.notifications];
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
