export class ConfigService {
  static instance = null;

  constructor() {
    this.config = {
      appName: import.meta.env.VITE_APP_NAME ?? 'Exam Management System',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
      mockDelayMs: Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 300),
      sessionKey: 'exam_app_session',
      defaultPageSize: 10,
      examAutoSaveIntervalMs: 30000,
    };
  }

  static getInstance() {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return { ...this.config };
  }
}
