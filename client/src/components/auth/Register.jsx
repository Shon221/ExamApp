import React, { useState } from 'react';
import authService from '../../services/AuthService.js';
import notifyService from '../../services/NotifyService.js';
import loggerService from '../../services/LoggerService.js';
import './Auth.css';

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      loggerService.info(`Registration attempt for: ${formData.email}`);
      const result = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      if (result.success) {
        loggerService.info(`Registration successful for: ${formData.email}`);
        notifyService.success(result.message);
        if (onRegisterSuccess) {
          onRegisterSuccess(result.user);
        }
      } else {
        loggerService.warn(`Registration failed: ${result.message}`);
        notifyService.error(result.message);
      }
    } catch (error) {
      loggerService.error(`Registration error: ${error.message}`);
      notifyService.error('Registration error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Register'}
        </button>

        <div className="auth-footer" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>Already have an account? <button type="button" className="btn-link" onClick={onBackToLogin}>Login here</button></p>
        </div>
      </form>
    </div>
  );
};

export default Register;
