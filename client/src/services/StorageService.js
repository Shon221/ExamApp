import { ConfigService } from './ConfigService';
import { LoggerService } from './LoggerService';

export class StorageService {
  static instance = null;

  constructor() {
    this.logger = LoggerService.getInstance();
  }

  static getInstance() {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.logger.error('StorageService.set failed', { key, error });
    }
  }

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (error) {
      this.logger.error('StorageService.get failed', { key, error });
      return null;
    }
  }

  remove(key) {
    localStorage.removeItem(key);
  }

  setSession(value) {
    const sessionKey = ConfigService.getInstance().get('sessionKey');
    this.set(sessionKey, value);
  }

  getSession() {
    const sessionKey = ConfigService.getInstance().get('sessionKey');
    return this.get(sessionKey);
  }

  clearSession() {
    const sessionKey = ConfigService.getInstance().get('sessionKey');
    this.remove(sessionKey);
  }
}
