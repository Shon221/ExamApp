import React, { useState } from 'react';
import authService from '../../services/AuthService.js';
import notifyService from '../../services/NotifyService.js';
import loggerService from '../../services/LoggerService.js';
import './Auth.css';

// קומפוננטת התחברות - מטפלת בטופס התחברות וקישור ל-AuthService
const Login = ({ onLoginSuccess, onNavigateToRegister }) => {
  // מצב הטופס - דוא"ל וסיסמה
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // מצב טעינה בזמן בקשה ל-API
  const [isLoading, setIsLoading] = useState(false);

  // הודעות שגיאה מן הטופס
  const [errors, setErrors] = useState({});

  // טיפול בשינוי בשדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // ניקוי שגיאה לשדה כשמשתמש מתחיל לערוך
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // טיפול בהגשת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // קריאה להתחברות דרך AuthService
      loggerService.info(`Login attempt for: ${formData.email}`);
      const result = await authService.login(formData.email, formData.password);

      if (result.success) {
        // התחברות בוצעה בהצלחה
        loggerService.info(`Login successful for: ${formData.email}`);
        notifyService.success(result.message);

        // קריאה לfunctionality שהתקבלה מ-props (ניווט לדשבורד)
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } else {
        // התחברות נכשלה
        loggerService.warn(`Login failed: ${result.message}`);
        notifyService.error(result.message);
      }
    } catch (error) {
      // טעות בלתי צפויה
      loggerService.error(`Login error: ${error.message}`);
      notifyService.error('שגיאה בהתחברות. אנא נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>ברוכים הבאים חזרה</h2>

        <div className="form-group">
          <label htmlFor="email">דוא"ל</label>
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
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">סיסמה</label>
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
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'טוען...' : 'התחברות'}
        </button>

        <div className="auth-footer">
          <p>
            עדיין אין לך חשבון?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onNavigateToRegister}
              disabled={isLoading}
            >
              הירשם כאן
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
