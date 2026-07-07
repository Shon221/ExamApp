import { UserRole } from '../entities';
import { LoggerService } from './LoggerService';
import { MockApiService } from './MockApiService';
import { NotifyService } from './NotifyService';
import { StorageService } from './StorageService';

export class AuthService {
  static instance = null;

  constructor() {
    this.api = MockApiService.getInstance();
    this.storage = StorageService.getInstance();
    this.logger = LoggerService.getInstance();
    this.notify = NotifyService.getInstance();
    this.currentUser = null;
    this.listeners = new Set();
    this.restoreSession();
  }

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isTeacher() {
    return this.currentUser?.role === UserRole.Teacher;
  }

  isStudent() {
    return this.currentUser?.role === UserRole.Student;
  }

  async login(request) {
    const response = await this.api.login(request);
    if (!response.success || !response.data) {
      this.notify.error(response.error ?? 'Login failed');
      return null;
    }
    this.setSession(response.data);
    this.notify.success(`Welcome, ${response.data.fullName}`);
    return response.data;
  }

  async register(request) {
    const response = await this.api.register(request);
    if (!response.success || !response.data) {
      this.notify.error(response.error ?? 'Registration failed');
      return null;
    }
    this.setSession(response.data);
    return response.data;
  }

  logout() {
    this.currentUser = null;
    this.storage.clearSession();
    this.logger.info('User logged out');
    this.emit();
    this.notify.info('Logged out');
  }

  setSession(user) {
    this.currentUser = user;
    this.storage.setSession(user);
    this.emit();
  }

  restoreSession() {
    const saved = this.storage.getSession();
    if (saved) {
      this.currentUser = saved;
      this.logger.debug('Session restored', { email: saved.email });
    }
  }

  emit() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }
}
