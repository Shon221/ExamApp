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
    this.loading = true;
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
    listener(this.getAuthState());
    return () => this.listeners.delete(listener);
  }

  getUser() {
    return this.currentUser;
  }

  getAuthState() {
    return {
      user: this.currentUser,
      isLoading: this.loading,
    };
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

    this.storage.setTokens(response.accessToken, response.refreshToken);
    this.setSession(response.data);
    return response.data;
  }

  logout() {
    const refreshToken = this.storage.getRefreshToken();
    this.api.logout(refreshToken).catch(() => {});
    this.currentUser = null;
    this.loading = false;
    this.storage.clearSession();
    this.storage.clearTokens();
    this.logger.info('User logged out');
    this.emit();
    this.notify.info('Logged out');
  }

  setSession(user) {
    this.currentUser = user;
    this.loading = false;
    this.storage.setSession(user);
    this.emit();
  }

  async restoreSession() {
    const token = this.storage.getAccessToken();

    if (!token) {
      this.clearInvalidSession();
      this.loading = false;
      this.emit();
      return;
    }

    try {
      const response = await this.api.getMe();
      if (response.success && response.data) {
        this.currentUser = response.data;
        this.storage.setSession(response.data);
        this.logger.debug('Session restored', { email: response.data.email });
      } else {
        this.clearInvalidSession();
      }
    } catch (error) {
      this.logger.error('Session restore failed', { error });
      this.clearInvalidSession();
    } finally {
      this.loading = false;
      this.emit();
    }
  }

  clearInvalidSession() {
    this.currentUser = null;
    this.storage.clearSession();
    this.storage.clearTokens();
  }

  emit() {
    const state = this.getAuthState();
    this.listeners.forEach((listener) => listener(state));
  }
}
