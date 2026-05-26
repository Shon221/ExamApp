import { ConfigService } from './ConfigService';
import { LoggerService } from './LoggerService';

export class StorageService {
  private static instance: StorageService | null = null;
  private readonly logger = LoggerService.getInstance();

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.logger.error('StorageService.set failed', { key, error });
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.error('StorageService.get failed', { key, error });
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  setSession<T>(value: T): void {
    const key = ConfigService.getInstance().get('sessionKey');
    this.set(key, value);
  }

  getSession<T>(): T | null {
    const key = ConfigService.getInstance().get('sessionKey');
    return this.get<T>(key);
  }

  clearSession(): void {
    const key = ConfigService.getInstance().get('sessionKey');
    this.remove(key);
  }
}
