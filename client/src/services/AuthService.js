import { UserRole } from '../entities';
import { BackendApiService } from './BackendApiService';
import { LoggerService } from './LoggerService';
import { NotifyService } from './NotifyService';
import { StorageService } from './StorageService';

export class AuthService {
  static instance = null;

  constructor() {
    this.api = BackendApiService.getInstance();
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

  async login({ email, password }) {
    const response = await this.api.login({ email, password });
    if (!response.success || !response.data) {
      this.notify.error(response.error ?? 'Login failed');
      return null;
    }
    // Store tokens
    this.storage.setTokens(response.accessToken, response.refreshToken);
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
    // Store tokens
    this.storage.setTokens(response.accessToken, response.refreshToken);
    this.setSession(response.data);
    return response.data;
  }

  logout() {
    // Attempt to notify server (fire-and-forget)
    const refreshToken = this.storage.getRefreshToken();
    this.api.logout(refreshToken).catch(() => {});
    this.currentUser = null;
    this.storage.clearSession();
    this.storage.clearTokens();
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
    const token = this.storage.getAccessToken();
    if (saved && token) {
      this.currentUser = saved;
      this.logger.debug('Session restored', { email: saved.email });
    } else if (saved && !token) {
      // Session exists but no token — clear stale session
      this.storage.clearSession();
    }
  }

  emit() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }
}
