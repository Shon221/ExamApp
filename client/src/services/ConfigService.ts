export interface IAppConfig {
  appName: string;
  apiBaseUrl: string;
  mockDelayMs: number;
  sessionKey: string;
  defaultPageSize: number;
  examAutoSaveIntervalMs: number;
}

export class ConfigService {
  private static instance: ConfigService | null = null;
  private readonly config: IAppConfig;

  private constructor() {
    this.config = {
      appName: import.meta.env.VITE_APP_NAME ?? 'Exam Management System',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
      mockDelayMs: Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 300),
      sessionKey: 'exam_app_session',
      defaultPageSize: 10,
      examAutoSaveIntervalMs: 30000,
    };
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get<K extends keyof IAppConfig>(key: K): IAppConfig[K] {
    return this.config[key];
  }

  getAll(): Readonly<IAppConfig> {
    return { ...this.config };
  }
}
