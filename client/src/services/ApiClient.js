/**
 * ApiClient.js
 * Generic fetch-based HTTP client for communicating with the Express backend.
 * Uses VITE_API_BASE_URL from environment and attaches JWT tokens automatically.
 */

import { StorageService } from './StorageService';
import { LoggerService } from './LoggerService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiClientClass {
  static instance = null;

  constructor() {
    this.baseUrl = BASE_URL;
    this.storage = StorageService.getInstance();
    this.logger = LoggerService.getInstance();
  }

  static getInstance() {
    if (!ApiClientClass.instance) {
      ApiClientClass.instance = new ApiClientClass();
    }
    return ApiClientClass.instance;
  }

  /**
   * Build headers for every request.
   * Always sends JSON; attaches Bearer token when available.
   */
  _headers() {
    return { 'Content-Type': 'application/json' };
  }

  /**
   * Core request method. All public methods delegate here.
   * Returns a uniform shape: { success, data, error }
   */
  async _request(method, path, body = undefined) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: this._headers(),
      credentials: 'include',
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const json = await response.json();

      if (!response.ok) {
        // Server returned a non-2xx status
        const message = json.message || `HTTP ${response.status}`;
        this.logger.error('ApiClient error', { method, path, status: response.status, message });
        return { success: false, error: message };
      }

      // Server responses follow { success: true, data: {...} } or { success: true, message: "..." }
      return {
        success: true,
        data: json.data ?? null,
        message: json.message ?? null,
      };
    } catch (error) {
      // Network error or JSON parse error
      const message = error instanceof Error ? error.message : 'Network error';
      this.logger.error('ApiClient network error', { method, path, message });
      return { success: false, error: message };
    }
  }

  async get(path) {
    return this._request('GET', path);
  }

  async post(path, body) {
    return this._request('POST', path, body);
  }

  async put(path, body) {
    return this._request('PUT', path, body);
  }

  async patch(path, body) {
    return this._request('PATCH', path, body);
  }

  async delete(path) {
    return this._request('DELETE', path);
  }
}

export { ApiClientClass as ApiClient };
