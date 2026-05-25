import React, { useState } from 'react';
import authService from '../../services/AuthService.js';
import validationService from '../../services/ValidationService.js';
import notifyService from '../../services/NotifyService.js';
import loggerService from '../../services/LoggerService.js';
import './Auth.css';

// קומפוננטת הרשמה - מטפלת בטופס הרשמה וקישור ל-AuthService
const Register = ({ onRegisterSuccess, onNavigateToLogin }) => {
  // מצב הטופס - שם, דוא"ל, סיסמה, אישור סיסמה, תפקיד
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' // ברירת מחדל: סטודנט
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

    // בדיקה ראשית - האם הסיסמאות תואמות
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'הסיסמאות אינן תואמות';
      setErrors({ confirmPassword: errorMsg });
      notifyService.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      // קריאה להרשמה דרך AuthService
      loggerService.info(`Registration attempt for: ${formData.email}`);
      const result = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      if (result.success) {
        // הרשמה בוצעה בהצלחה
        loggerService.info(`Registration successful for: ${formData.email}`);
        notifyService.success(result.message);

        // קריאה לfunction שהתקבל מ-props (ניווט לדשבורד)
        if (onRegisterSuccess) {
          onRegisterSuccess(result.user);
        }
      } else {
        // הרשמה נכשלה
        loggerService.warn(`Registration failed: ${result.message}`);
        notifyService.error(result.message);
      }
    } catch (error) {
      // טעות בלתי צפויה
      loggerService.error(`Registration error: ${error.message}`);
      notifyService.error('שגיאה בהרשמה. אנא נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>יצירת חשבון חדש</h2>

        <div className="form-group">
          <label htmlFor="name">שם מלא</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="יוחנן דו"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

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
          <small>לפחות 8 תווים, אות גדולה ומספר</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">אישור סיסמה</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">תפקיד</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
            required
          >
            <option value="student">סטודנט</option>
            <option value="lecturer">מרצה</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'יוצר חשבון...' : 'הרשמה'}
        </button>

        <div className="auth-footer">
          <p>
            כבר יש לך חשבון?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onNavigateToLogin}
              disabled={isLoading}
            >
              התחבר כאן
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
