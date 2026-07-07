import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { ConfigService } from '../../services';
import './AuthPages.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('lecturer@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const appName = ConfigService.getInstance().get('appName');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const sessionUser = await login({ email, password });
    setLoading(false);
    if (sessionUser) {
      navigate(sessionUser.role === UserRole.Teacher ? '/teacher' : '/student');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">{appName}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>
        <div className="auth-hint">
          <strong>Demo accounts:</strong>
          <br />
          Lecturer: lecturer@example.com / 123456
          <br />
          Student: student@example.com / 123456
        </div>
      </div>
    </div>
  );
}
