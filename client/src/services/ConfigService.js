class ConfigService {
  #config;

  constructor() {
    this.#config = {
      apiUrl: import.meta.env?.MODE === 'production'
        ? 'https://exam-app-api.onrender.com/api'
        : 'http://localhost:5000/api',
      appVersion: '1.0.0',
      environment: import.meta.env?.MODE || 'development',
      timeout: 5000,
      appName: 'E-Test System',
      features: {
        registrationEnabled: true,
        autoSaveInterval: 30000,
        enableLogs: true
      },
      auth: {
        tokenKey: 'exam_auth_token',
        sessionDuration: 3600
      }
    };
  }

  get(key) {
    if (key.includes('.')) {
      return key.split('.').reduce((obj, i) => (obj ? obj[i] : undefined), this.#config);
    }
    return this.#config[key];
  }

  set(key, value) {
    if (key.includes('.')) {
      const keys = key.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((obj, i) => (obj[i] = obj[i] || {}), this.#config);
      target[lastKey] = value;
    } else {
      this.#config[key] = value;
    }
  }

  getAll() {
    return Object.freeze({ ...this.#config });
  }

  isProduction() {
    return this.#config.environment === 'production';
  }

  isDevelopment() {
    return this.#config.environment === 'development';
  }
}

const configService = new ConfigService();
Object.freeze(configService);
export default configService;
