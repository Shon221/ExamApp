/**
 * Configuration Service - Handles global application settings and environment-specific logic.
 * Follows the Singleton pattern to ensure a single instance throughout the application.
 */
class ConfigService {
  /**
   * Private field - holds the configuration object.
   * Encapsulated to prevent direct external modification.
   * @type {Object}
   */
  #config;

  constructor() {
    /**
     * Initial configuration based on the environment (development/production).
     * Includes API URLs, application versioning, and feature toggles.
     */
    this.#config = {
      // API base URL, adjusted per environment mode.
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

  /**
   * Retrieves a configuration value by its key.
   * Supports dot notation for nested properties (e.g., 'features.enableLogs').
   * @param {string} key - The key of the configuration value to retrieve.
   * @returns {*} The value associated with the key, or undefined if not found.
   */
  get(key) {
    if (key.includes('.')) {
      return key.split('.').reduce((obj, i) => (obj ? obj[i] : undefined), this.#config);
    }
    return this.#config[key];
  }

  /**
   * Dynamically updates a configuration value.
   * Supports dot notation for updating nested properties.
   * @param {string} key - The key of the value to change.
   * @param {*} value - The new value to assign.
   */
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

  /**
   * Returns a deep copy of the configuration object.
   * The returned object is frozen to maintain read-only integrity.
   * @returns {Object} A frozen copy of the configuration.
   */
  getAll() {
    return Object.freeze({ ...this.#config });
  }

  /**
   * Helper to check if the current environment is production.
   * @returns {boolean} True if mode is production.
   */
  isProduction() {
    return this.#config.environment === 'production';
  }

  /**
   * Helper to check if the current environment is development.
   * @returns {boolean} True if mode is development.
   */
  isDevelopment() {
    return this.#config.environment === 'development';
  }
}

// Create a singleton instance and freeze it to prevent property manipulation.
const configService = new ConfigService();
Object.freeze(configService);
export default configService;
