import { UserRole } from '../entities';
import type { IUserData } from '../entities';
import { LoggerService } from './LoggerService';
import { MockApiService } from './MockApiService';
import type { ILoginRequest, IRegisterRequest } from './MockApiService';
import { NotifyService } from './NotifyService';
import { StorageService } from './StorageService';

export type SessionUser = Omit<IUserData, 'password'>;

export class AuthService {
  private static instance: AuthService | null = null;
  private readonly api = MockApiService.getInstance();
  private readonly storage = StorageService.getInstance();
  private readonly logger = LoggerService.getInstance();
  private readonly notify = NotifyService.getInstance();
  private currentUser: SessionUser | null = null;
  private listeners: Set<(user: SessionUser | null) => void> = new Set();

  private constructor() {
    this.restoreSession();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  subscribe(listener: (user: SessionUser | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  getUser(): SessionUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isTeacher(): boolean {
    return this.currentUser?.role === UserRole.Teacher;
  }

  isStudent(): boolean {
    return this.currentUser?.role === UserRole.Student;
  }

  async login(request: ILoginRequest): Promise<SessionUser | null> {
    const response = await this.api.login(request);
    if (!response.success || !response.data) {
      this.notify.error(response.error ?? 'Login failed');
      return null;
    }
    this.setSession(response.data);
    this.notify.success(`Welcome, ${response.data.fullName}`);
    return response.data;
  }

  async register(request: IRegisterRequest): Promise<SessionUser | null> {
    const response = await this.api.register(request);
    if (!response.success || !response.data) {
      this.notify.error(response.error ?? 'Registration failed');
      return null;
    }
    this.setSession(response.data);
    return response.data;
  }

  logout(): void {
    this.currentUser = null;
    this.storage.clearSession();
    this.logger.info('User logged out');
    this.emit();
    this.notify.info('Logged out');
  }

  private setSession(user: SessionUser): void {
    this.currentUser = user;
    this.storage.setSession(user);
    this.emit();
  }

  private restoreSession(): void {
    const saved = this.storage.getSession<SessionUser>();
    if (saved) {
      this.currentUser = saved;
      this.logger.debug('Session restored', { email: saved.email });
    }
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }
}
